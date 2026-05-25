import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const RoleRoute = ({ children, roles }) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role || 'magasinier'; // Default safe fallback

  if (roles && !roles.includes(userRole)) {
    // Redirige vers le dashboard s'il n'a pas accès, ou login
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
