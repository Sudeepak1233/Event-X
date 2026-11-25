
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ allowedRoles = [] }) {
  const isOwnerRoute = allowedRoles.includes("owner");
  const { user } = useAuth();
  const location = useLocation();
  const [ownerAuthorized, setOwnerAuthorized] = useState(false);
  const [checkingOwnerSession, setCheckingOwnerSession] = useState(isOwnerRoute);

  useEffect(() => {
    if (!isOwnerRoute) return undefined;

    let active = true;
    fetch("/api/auth/session", { credentials: "include" })
      .then((response) => {
        if (active) {
          setOwnerAuthorized(response.ok);
          setCheckingOwnerSession(false);
        }
      })
      .catch((error) => {
        console.error("Could not verify the owner session.", error);
        if (active) {
          setOwnerAuthorized(false);
          setCheckingOwnerSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOwnerRoute]);

  if (isOwnerRoute) {
    if (checkingOwnerSession) {
      return <div className="route-loading" role="status">Verifying owner session...</div>;
    }

    return ownerAuthorized
      ? <Outlet />
      : <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
