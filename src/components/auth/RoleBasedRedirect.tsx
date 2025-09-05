import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/users" replace />;
    case 'trainer':
      return <Navigate to="/trainer/dashboard" replace />;
    case 'user':
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

export default RoleBasedRedirect;
