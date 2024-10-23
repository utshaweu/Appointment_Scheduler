import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

interface Appointment {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  userId: string;
  withUserId: string;
  withUsername?: string;
  schedulerUsername?: string;
  status?: "pending" | "accepted" | "declined" | "cancelled";
}

const AppointmentList: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Function to fetch appointments
  const fetchAppointments = async () => {
    if (currentUser) {
      const appointmentsRef = collection(db, "appointments");

      const q = query(
        appointmentsRef,
        where("userId", "==", currentUser?.uid),
        orderBy("date", "asc"),
        orderBy("time", "asc")
      );

      const q2 = query(
        appointmentsRef,
        where("withUserId", "==", currentUser?.uid),
        orderBy("date", "asc"),
        orderBy("time", "asc")
      );

      const schedulerSnapshot = await getDocs(q);
      const holderSnapshot = await getDocs(q2);

      const schedulerAppointments = schedulerSnapshot?.docs.map((doc) => ({
        id: doc?.id,
        ...doc?.data(),
      })) as Appointment[];

      const holderAppointments = holderSnapshot?.docs.map((doc) => ({
        id: doc?.id,
        ...doc?.data(),
      })) as Appointment[];

      const allAppointments = [...schedulerAppointments, ...holderAppointments];

      const updatedAppointments = await Promise.all(
        allAppointments.map(async (appointment) => {
          let withUsername = "Unknown User";
          let schedulerUsername = "Unknown Scheduler";

          if (appointment?.withUserId) {
            const userDoc = await getDoc(
              doc(db, "users", appointment?.withUserId)
            );
            if (userDoc.exists()) {
              withUsername = userDoc?.data()?.username;
            }
          }

          if (appointment?.userId) {
            const schedulerDoc = await getDoc(
              doc(db, "users", appointment?.userId)
            );
            if (schedulerDoc.exists()) {
              schedulerUsername = schedulerDoc?.data()?.username;
            }
          }

          return { ...appointment, withUsername, schedulerUsername };
        })
      );

      setAppointments(updatedAppointments);
    }
  };

  const isScheduler = (appointment: Appointment) =>
    currentUser?.uid === appointment?.userId;

  const getFilteredAppointments = (): Appointment[] => {
    const now = new Date();
    return appointments.filter((appointment) => {
      const appointmentDateTime = new Date(
        `${appointment?.date}T${appointment?.time}`
      );
      if (filter === "upcoming") {
        return appointmentDateTime > now;
      } else if (filter === "past") {
        return appointmentDateTime <= now;
      }
      return true; // 'all' filter
    });
  };

  const getSearchedAppointments = (): Appointment[] => {
    const filtered = getFilteredAppointments();
    if (!searchTerm) return filtered;
    return filtered.filter(
      (appointment) =>
        appointment?.title?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        appointment?.description
          ?.toLowerCase()
          .includes(searchTerm?.toLowerCase())
    );
  };

  const filteredAppointments = getSearchedAppointments();

  // Cancel appointment function
  const cancelAppointment = async (appointmentId: string) => {
    setLoadingId(appointmentId);
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: "cancelled",
      });
      console.log("Appointment cancelled:", appointmentId);

      // Fetch updated appointments after successful cancellation
      await fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setLoadingId(null);
    }
  };

  // Respond to appointment function
  const respondToAppointment = async (
    appointmentId: string,
    status: "accepted" | "declined"
  ) => {
    setLoadingId(appointmentId);
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status,
      });
      console.log(
        `Appointment ${appointmentId} responded with status: ${status}`
      );

      // Fetch updated appointments after successful response
      await fetchAppointments();
    } catch (error) {
      console.error("Error responding to appointment:", error);
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    if (location?.state?.appointmentCreated || currentUser) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, location.state?.appointmentCreated]);

  return (
    <div className="container">
      <h2 className="text-primary text-center h5">Manage Your Appointments</h2>

      {/* Search Input */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by title or description"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Filter Buttons */}
      <div className="mb-3">
        <button
          className={`btn ${
            filter === "all" ? "btn-primary" : "btn-outline-primary"
          } me-2`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`btn ${
            filter === "upcoming" ? "btn-primary" : "btn-outline-primary"
          } me-2`}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`btn ${
            filter === "past" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setFilter("past")}
        >
          Past
        </button>
      </div>

      {/* Appointment List */}
      <ul className="list-group">
        {filteredAppointments?.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <li key={appointment?.id} className="list-group-item">
              <h5>{appointment?.title}</h5>
              <span>{appointment?.description}</span>
              <br />
              <span>Date: {appointment?.date}</span>
              <br />
              <span>Time: {appointment?.time}</span>
              <br />

              {isScheduler(appointment) ? (
                <p className="text-muted">
                  You scheduled this appointment with{" "}
                  <strong>{appointment?.withUsername}</strong>.
                </p>
              ) : (
                <p className="text-muted">
                  <strong>{appointment?.schedulerUsername}</strong> scheduled
                  this appointment with you.
                </p>
              )}

              {isScheduler(appointment) &&
                new Date(`${appointment?.date}T${appointment?.time}`) >
                  new Date() &&
                appointment?.status !== "cancelled" && (
                  <button
                    className="btn btn-danger mt-2"
                    onClick={() => cancelAppointment(appointment?.id)}
                    disabled={loadingId === appointment?.id}
                  >
                    {loadingId === appointment?.id ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      "Cancel Appointment"
                    )}
                  </button>
                )}

              {!isScheduler(appointment) &&
                appointment?.status === "pending" && (
                  <div>
                    <button
                      className="btn btn-success mt-2 me-2"
                      onClick={() =>
                        respondToAppointment(appointment?.id, "accepted")
                      }
                      disabled={loadingId === appointment?.id}
                    >
                      {loadingId === appointment?.id ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        "Accept"
                      )}
                    </button>
                    <button
                      className="btn btn-danger mt-2"
                      onClick={() =>
                        respondToAppointment(appointment?.id, "declined")
                      }
                      disabled={loadingId === appointment?.id}
                    >
                      {loadingId === appointment?.id ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        "Decline"
                      )}
                    </button>
                  </div>
                )}

              {appointment?.status === "accepted" && (
                <p className="text-success">
                  <b>Accepted</b>
                </p>
              )}
              {appointment?.status === "declined" && (
                <p className="text-warning">
                  <b>Declined</b>
                </p>
              )}
              {appointment?.status === "cancelled" && (
                <p className="text-danger">
                  <b>Cancelled</b>
                </p>
              )}
            </li>
          ))
        ) : (
          <p>No appointments found.</p>
        )}
      </ul>
    </div>
  );
};

export default AppointmentList;
