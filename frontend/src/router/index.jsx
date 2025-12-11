import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import MemberDashboard from '../pages/MemberDashboard';
import Projects from '../pages/Projects';
import Tasks from '../pages/Tasks';
import TaskBoard from '../pages/TaskBoard';
import TaskView from '../pages/TaskView';
import Calendar from '../pages/Calendar';
import Clients from '../pages/Clients';
import ActivityLogs from '../pages/ActivityLogs';
import Employees from '../pages/Employees';
import Settings from '../pages/Settings';

/**
 * ProtectedRoute Component
 * Wrapper for routes that require authentication
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * DashboardRouter Component
 * Routes to appropriate dashboard based on user role
 */
const DashboardRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else if (user?.role === 'manager') {
    return <ManagerDashboard />;
  } else {
    return <MemberDashboard />;
  }
};

/**
 * AppRouter Component
 * Main application routing configuration
 */
const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardRouter />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId/tasks" element={<TaskBoard />} />
        <Route path="projects/:projectId/tasks/:taskId" element={<TaskView />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="clients" element={<Clients />} />
        <Route path="employees" element={<Employees />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all - redirect to dashboard or login */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRouter;
