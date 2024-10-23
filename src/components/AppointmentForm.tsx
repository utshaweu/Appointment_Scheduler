import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

interface AppointmentFormProps {
  withUserId: string;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  withUserId,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !date || !time) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "appointments"), {
        title,
        description,
        date,
        time,
        userId: currentUser?.uid, // The user scheduling the appointment
        withUserId, // The user with whom the appointment is scheduled
        createdAt: new Date(),
        status: "pending", // Pending status by default
      });

      navigate("/dashboard", { state: { appointmentCreated: true } });
      onCancel();
    } catch (error) {
      setError("Failed to schedule an appointment. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      {error && <p className="alert alert-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label text-start">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label text-start">
            Description
          </label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="date" className="form-label text-start">
            Date
          </label>
          <input
            type="date"
            id="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="time" className="form-label text-start">
            Time
          </label>
          <input
            type="time"
            id="time"
            className="form-control"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ fontSize: "14px" }}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              "Schedule Appointment"
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={onCancel}
            disabled={loading}
            style={{ fontSize: "14px" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
