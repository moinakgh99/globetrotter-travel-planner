import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../lib/api";

const ProtectedRoute = ({ children }) => {
  const authed = isAuthenticated();

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
