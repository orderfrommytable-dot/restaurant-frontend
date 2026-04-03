import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the user has a valid token in their browser
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated) {
    // Kick them back to the login page
    return <Navigate to="/login" replace />;
  }

  // If they have the token, let them into the dashboard
  return children;
};

export default ProtectedRoute;