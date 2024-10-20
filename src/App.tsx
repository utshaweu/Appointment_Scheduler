import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Private Route Component
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser, loading } = useAuth();

  // While loading, return nothing or a loader
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is not logged in, redirect to login
  return currentUser ? children : <Navigate to="/login" />;
};

// Error Page Component
const ErrorPage: React.FC = () => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          <div className="text-center mt-4">
            <h2 className="text-danger">404 - Page Not Found</h2>
            <p className="text-secondary">The page you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Route for Dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Catch-all Route for non-existent pages */}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
};
export default App;
