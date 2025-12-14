import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';
import AdminLayout from '../layouts/AdminLayout';
import ManagerLayout from '../layouts/ManagerLayout';
import DeveloperLayout from '../layouts/DeveloperLayout';
import ClientLayout from '../layouts/ClientLayout';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import DeveloperDashboard from '../pages/DeveloperDashboard';
import ClientDashboard from '../pages/ClientDashboard';
import AdminTasks from '../pages/admin/AdminTasks';
import ManagerTasks from '../pages/manager/ManagerTasks';
import DeveloperTasks from '../pages/developer/DeveloperTasks';
import ClientTasks from '../pages/client/ClientTasks';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import UserAnalytics from '../pages/UserAnalytics';
import UserDetails from '../pages/UserDetails';
import Tasks from '../pages/Tasks';
import TaskBoard from '../pages/TaskBoard';
import TaskView from '../pages/TaskView';
import Calendar from '../pages/Calendar';
import Clients from '../pages/Clients';
import ActivityLogs from '../pages/ActivityLogs';
import Employees from '../pages/Employees';
import Chat from '../pages/Chat';
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
 * RoleRoute Component (middleware-like)
 * Restricts access based on user role
 */
const RoleRoute = ({ allowed, children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

/**
 * AppRouter Component
 * Main application routing configuration with role-based route prefixes
 */
const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  // Get role-specific prefix for redirect
  const getRolePrefix = (role) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'project_manager': return '/manager';
      case 'developer': return '/developer';
      case 'client': return '/client';
      default: return '';
    }
  };

  const rolePrefix = user ? getRolePrefix(user.role) : '';

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={user ? <Navigate to={`${rolePrefix}/dashboard`} replace /> : <Login />}
      />

      {/* Root redirect */}
      <Route 
        index 
        element={user ? <Navigate to={`${rolePrefix}/dashboard`} replace /> : <Navigate to="/login" replace />} 
      />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["admin"]}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="projects/:projectId/tasks" element={<TaskBoard />} />
        <Route path="projects/:projectId/tasks/:taskId" element={<TaskView />} />
        <Route path="users/:userId/analytics" element={<UserAnalytics />} />
        <Route path="users/:userType/:userId" element={<UserDetails />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="clients" element={<Clients />} />
        <Route path="employees" element={<Employees />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Manager routes */}
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["project_manager"]}>
              <ManagerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="projects/:projectId/tasks" element={<TaskBoard />} />
        <Route path="projects/:projectId/tasks/:taskId" element={<TaskView />} />
        <Route path="users/:userId/analytics" element={<UserAnalytics />} />
        <Route path="users/:userType/:userId" element={<UserDetails />} />
        <Route path="tasks" element={<ManagerTasks />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Developer routes */}
      <Route
        path="/developer/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["developer"]}>
              <DeveloperLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/developer/dashboard" replace />} />
        <Route path="dashboard" element={<DeveloperDashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="projects/:projectId/tasks" element={<TaskBoard />} />
        <Route path="projects/:projectId/tasks/:taskId" element={<TaskView />} />
        <Route path="users/:userId/analytics" element={<UserAnalytics />} />
        <Route path="users/:userType/:userId" element={<UserDetails />} />
        <Route path="tasks" element={<DeveloperTasks />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Client routes */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["client"]}>
              <ClientLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/client/dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="projects/:projectId/tasks" element={<TaskBoard />} />
        <Route path="projects/:projectId/tasks/:taskId" element={<TaskView />} />
        <Route path="users/:userId/analytics" element={<UserAnalytics />} />
        <Route path="users/:userType/:userId" element={<UserDetails />} />
        <Route path="tasks" element={<ClientTasks />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all - redirect based on auth status */}
      <Route
        path="*"
        element={<Navigate to={user ? `${rolePrefix}/dashboard` : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRouter;
