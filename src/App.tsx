import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Dashboard from '@/pages/Dashboard';

// Restore user pages
const Bookings = React.lazy(() => import('@/pages/Bookings'));
const Membership = React.lazy(() => import('@/pages/Membership'));
const QRCodes = React.lazy(() => import('@/pages/QRCodes'));
const Referral = React.lazy(() => import('@/pages/Referral'));

// Lazy load other pages for better performance
const AdminPanel = React.lazy(() => import('@/pages/AdminPanel'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const TrainerDashboard = React.lazy(() => import('@/pages/TrainerDashboard'));
const PersonalTraining = React.lazy(() => import('@/pages/PersonalTraining'));
const PersonalTrainingSchedule = React.lazy(() => import('@/pages/PersonalTrainingSchedule'));

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

        {/* User routes */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<div>Φόρτωση...</div>}>
                  <Bookings />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<div>Φόρτωση...</div>}>
                  <Membership />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-codes"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<div>Φόρτωση...</div>}>
                  <QRCodes />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/referral"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<div>Φόρτωση...</div>}>
                  <Referral />
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

        {/* Trainer route - μόνο Πίνακας Ελέγχου */}
        <Route
          path="/trainer/dashboard"
          element={
            <ProtectedRoute requiredRole="trainer">
              <Layout>
                <React.Suspense fallback={<div>Φόρτωση...</div>}>
                  <TrainerDashboard />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Personal Training - Public route (accessible with code) */}
        <Route
          path="/personal-training"
          element={
            <React.Suspense fallback={<div>Φόρτωση...</div>}>
              <PersonalTraining />
            </React.Suspense>
          }
        />

        {/* Personal Training Schedule - Protected route for users with Personal Training codes */}
        <Route
          path="/personal-training-schedule"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<div>Φόρτωση...</div>}>
                  <PersonalTrainingSchedule />
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
