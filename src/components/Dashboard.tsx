import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { currentUser, username } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [currentUser, navigate]);

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="row w-100">
        <div className="col-md-6 offset-md-3">
          <div className="card p-4 shadow-sm">
            <h2 className="text-center text-primary">Dashboard</h2>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading...</p>
              </div>
            ) : currentUser ? (
              <div className="text-center">
                <p>
                  Welcome, <strong>{username}</strong>!
                </p>
                <p>Email: {currentUser?.email}</p>
                <button className="btn btn-danger w-100" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <p>User not found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
