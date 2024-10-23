import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
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
}

const AppointmentList: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (currentUser) {
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("userId", "==", currentUser?.uid), // Fetch current user's appointments
          orderBy("date", "asc"),
          orderBy("time", "asc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedAppointments = querySnapshot.docs.map((doc) => ({
          id: doc?.id,
          ...doc?.data(),
        })) as Appointment[];

        // Fetch the other user's (withUserId) name for each appointment
        const updatedAppointments = await Promise.all(
          fetchedAppointments.map(async (appointment) => {
            if (appointment?.withUserId) {
              const userDoc = await getDoc(
                doc(db, "users", appointment?.withUserId)
              );
              const withUsername = userDoc.exists()
                ? userDoc?.data()?.username
                : "Unknown User";
              return { ...appointment, withUsername };
            }
            return appointment;
          })
        );

        setAppointments(updatedAppointments);
      }
    };

    if (location?.state?.appointmentCreated || currentUser) {
      fetchAppointments();
    }
  }, [currentUser, location.state?.appointmentCreated]);

  // Filter logic for upcoming and past appointments
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

  // Search logic
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
              <span style={{ fontWeight: 500 }}>
                <i>With: {appointment?.withUsername}</i>
              </span>
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
