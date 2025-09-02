import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Dashboard from '@/pages/Dashboard';

// Lazy load other pages for better performance
const AdminPanel = React.lazy(() => import('@/pages/AdminPanel'));
const Profile = React.lazy(() => import('@/pages/Profile'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Protected routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<div>Φόρτωση...</div>}>
                  <Profile />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <React.Suspense fallback={<div>Φόρτωση...</div>}>
                  <AdminPanel />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
