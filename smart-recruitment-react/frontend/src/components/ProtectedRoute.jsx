import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex-center" style={{ minHeight: '100vh' }}><span className="spinner"></span></div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;

  return children;
}
