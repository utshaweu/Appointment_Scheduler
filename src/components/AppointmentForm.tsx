import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

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
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Error timeout handler
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle audio upload to Firebase Storage
  const handleAudioUpload = async () => {
    if (!audioFile) return null;
    const audioRef = ref(storage, `audioMessages/${uuidv4()}.mp3`);
    await uploadBytes(audioRef, audioFile);
    return getDownloadURL(audioRef);
  };

  // Handle form submission with audio URL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !time) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const audioUrl = audioFile ? await handleAudioUpload() : null;
      await addDoc(collection(db, "appointments"), {
        title,
        description,
        date,
        time,
        userId: currentUser?.uid,
        withUserId,
        createdAt: new Date(),
        status: "pending",
        audioUrl: audioUrl,
      });
      navigate("/dashboard", { state: { appointmentCreated: true } });
      onCancel();
    } catch (error) {
      setError("Failed to schedule an appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle audio file selection with size validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        // 1MB size limit
        setError("File size must be 1MB or less.");
        setAudioFile(null);
      } else {
        setAudioFile(file);
      }
    }
  };

  return (
    <div className="container">
      {error && <p className="alert alert-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
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
          <label htmlFor="description" className="form-label">
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
          <label htmlFor="date" className="form-label">
            Date
          </label>
          <input
            type="date"
            id="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="time" className="form-label">
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
        <div className="mb-3">
          <label htmlFor="audio" className="form-label">
            Audio Message (Max 1MB) Optional
          </label>
          <input
            type="file"
            id="audio"
            className="form-control"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        <div className="text-center">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "Schedule Appointment"
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
