import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminDashboard from './pages/dashboards/AdminDashboard.jsx';
import RecruiterDashboard from './pages/dashboards/RecruiterDashboard.jsx';
import CandidateDashboard from './pages/dashboards/CandidateDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin/dashboard/*"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/dashboard/*"
        element={
          <ProtectedRoute role="recruiter">
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/dashboard/*"
        element={
          <ProtectedRoute role="candidate">
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
