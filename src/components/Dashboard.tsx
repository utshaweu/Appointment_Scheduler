import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import UserList from "./UserList";
import AppointmentForm from "./AppointmentForm";
import AppointmentList from "./AppointmentList";

interface SelectedUser {
  id: string;
  username: string;
}

const Dashboard: React.FC = () => {
  const { currentUser, username } = useAuth();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null); // Track selected user

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Handle selecting a user from the UserList
  const handleUserSelect = (user: SelectedUser) => {
    setSelectedUser(user); // Set the selected user
  };

  // Handle going back to the user list
  const handleBackToUserList = () => {
    setSelectedUser(null); // Reset selected user to go back to user search
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="d-flex justify-content-center align-items-center dashboard">
            <div className="card p-md-4 p-sm-2 shadow-sm">
              <h2 className="text-center text-primary">Dashboard</h2>
              {currentUser ? (
                <>
                  <div className="text-center">
                    <p>
                      Welcome, <strong>{username}</strong>!
                    </p>
                    <p>Email: {currentUser?.email}</p>
                  </div>
                  <hr />
                  {!selectedUser ? (
                    <div>
                      <h3 className="text-center h6">
                        Search and Select a User to Schedule an Appointment
                      </h3>
                      {/* Render UserList component */}
                      <UserList onUserSelect={handleUserSelect} />
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-center h6">
                        Schedule an Appointment with{" "}
                        <b>{selectedUser?.username}</b>
                      </h3>
                      {/* Render AppointmentForm component */}
                      <AppointmentForm
                        withUserId={selectedUser?.id}
                        onCancel={handleBackToUserList}
                      />
                    </div>
                  )}

                  <div className="mt-5">
                    <h3 className="text-center h6">Your Appointments</h3>
                    <AppointmentList />
                  </div>

                  <div style={{ position: "sticky", bottom: 0 }}>
                    <button
                      className="btn btn-danger w-100 mt-4"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
