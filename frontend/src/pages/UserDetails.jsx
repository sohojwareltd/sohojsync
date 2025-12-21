import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

/**
 * User Details Page
 * Enhanced analytics for Project Managers, Clients, and Developers
 * Features: Charts, Graphs, Task Analytics, Project Performance
 */
const UserDetails = () => {
  const { userId, userType } = useParams(); // userType: 'project-manager', 'client', 'developer'
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
    fetchUserAnalytics();
    fetchUserProjects();
    if (userType === 'developer' || userType === 'project-manager') {
      fetchUserTasks();
    }
  }, [userId, userType]);

  const fetchUserDetails = async () => {
    try {
      const endpoint = userType === 'client' ? `/clients/${userId}` : `/users/${userId}`;
      const response = await axiosInstance.get(endpoint);
      const payload = response.data?.data ?? response.data ?? {};
      const normalized = {
        id: payload.id || payload.user_id || userId,
        name: payload.name || payload.user?.name || payload.client?.name || 'Unknown',
        email: payload.email || payload.user?.email || payload.client?.email || '',
        role: userType || payload.role || payload.user?.role || '',
        phone: payload.phone || payload.user?.phone || '',
        company: payload.company || payload.client?.company || '',
        profile_image: payload.profile_image || payload.user?.profile_image || payload.client?.profile_image || '',
      };
      setUser(normalized);
    } catch (error) {
      // Swallow error; keep page usable
      setUser({ id: userId, name: 'Unknown', email: '', role: userType });
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      // Use fallback analytics quietly if API unavailable
      setAnalytics({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completionRate: 0
      });
    }
  };

  const fetchUserProjects = async () => {
    try {
      let response;
      if (userType === 'client') {
        response = await axiosInstance.get(`/projects?client_id=${userId}`);
      } else if (userType === 'project-manager') {
        response = await axiosInstance.get(`/projects?project_manager_id=${userId}`);
      } else {
        response = await axiosInstance.get(`/projects?developer_id=${userId}`);
      }
      setProjects(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTasks = async () => {
    try {
      const response = await axiosInstance.get(`/tasks?assigned_to=${userId}`);
      setTasks(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    }
  };

  const getUserTypeInfo = () => {
    switch(userType) {
      case 'project-manager':
        return {
          title: 'Project Manager',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          ),
          gradient: 'from-purple-500 to-purple-700',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600',
          borderColor: 'border-purple-300'
        };
      case 'client':
        return {
          title: 'Client',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
          ),
          gradient: 'from-blue-500 to-blue-700',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-300'
        };
      case 'developer':
        return {
          title: 'Developer',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          ),
          gradient: 'from-green-500 to-green-700',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          borderColor: 'border-green-300'
        };
      default:
        return {
          title: 'User',
          icon: null,
          gradient: 'from-gray-500 to-gray-700',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-300'
        };
    }
  };

  const startChat = () => {
    // Keep navigation scoped to the current role prefix so it matches defined routes
    const baseSegment = location.pathname.split('/')?.[1] || 'admin';
    navigate(`/${baseSegment}/chat?userId=${userId}`);
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <Link to="/projects" className="text-purple-600 hover:underline">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const userInfo = getUserTypeInfo();
  const completionRate = analytics?.totalTasks > 0 
    ? ((analytics.completedTasks / analytics.totalTasks) * 100).toFixed(1) 
    : 0;

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    planning: projects.filter(p => p.status === 'planning').length,
    onHold: projects.filter(p => p.status === 'on_hold').length
  };

  // Calculate task statistics for developers/PMs
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending' || t.status === 'todo').length,
    overdue: tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < new Date();
    }).length
  };

  // Project completion rate
  const projectCompletionRate = projectStats.total > 0 
    ? ((projectStats.completed / projectStats.total) * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-5 pb-8">
      {/* Modern Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/projects"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </Link>
            <div className="flex items-center gap-3">
                {user.profile_image ? (
                  <img
                    src={`${import.meta.env.VITE_APP_URL || ''}/storage/${user.profile_image}`}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold" style={{background: 'rgb(89, 86, 157)'}}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {userInfo.title}
                  </span>
                </div>
            </div>
          </div>
          <button
            onClick={startChat}
            className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
            style={{background: 'rgb(89, 86, 157)'}}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
            </svg>
            Chat
          </button>
        </div>

        {/* Contact Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span className="font-medium">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span className="font-medium">{user.phone}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">{user.company}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg" style={{background: 'rgba(89, 86, 157, 0.1)'}}>
              <svg className="w-5 h-5" style={{color: 'rgb(89, 86, 157)'}} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {projectStats.inProgress} active
              </p>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Projects</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-green-50">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-gray-900">{taskStats.completed}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                of {taskStats.total} tasks
              </p>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Completed Tasks</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-gray-900">{taskStats.inProgress}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {taskStats.pending} pending
              </p>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600">In Progress</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-lg ${taskStats.overdue > 0 ? 'bg-red-50' : 'bg-purple-50'}`}>
              <svg className={`w-5 h-5 ${taskStats.overdue > 0 ? 'text-red-600' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-gray-900">{completionRate}%</p>
              <p className={`text-xs mt-0.5 font-medium ${taskStats.overdue > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {taskStats.overdue > 0 ? `${taskStats.overdue} overdue` : 'On track'}
              </p>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Completion Rate</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Project Status Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5" style={{color: 'rgb(89, 86, 157)'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
            Project Status Distribution
          </h3>
          <div className="space-y-3">
            {/* Completed */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-600">Completed</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {projectStats.completed} ({projectStats.total > 0 ? ((projectStats.completed / projectStats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${projectStats.total > 0 ? (projectStats.completed / projectStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-600">In Progress</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {projectStats.inProgress} ({projectStats.total > 0 ? ((projectStats.inProgress / projectStats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${projectStats.total > 0 ? (projectStats.inProgress / projectStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Planning */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-gray-700">Planning</span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {projectStats.planning} ({projectStats.total > 0 ? ((projectStats.planning / projectStats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${projectStats.total > 0 ? (projectStats.planning / projectStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* On Hold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-sm font-medium text-gray-700">On Hold</span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {projectStats.onHold} ({projectStats.total > 0 ? ((projectStats.onHold / projectStats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-gray-500 to-gray-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${projectStats.total > 0 ? (projectStats.onHold / projectStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Status Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
            </svg>
            Task Progress Overview
          </h3>
          <div className="space-y-4">
            {/* Completed Tasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {taskStats.completed} ({taskStats.total > 0 ? ((taskStats.completed / taskStats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* In Progress Tasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">In Progress</span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {taskStats.inProgress} ({taskStats.total > 0 ? ((taskStats.inProgress / taskStats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.inProgress / taskStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {taskStats.pending} ({taskStats.total > 0 ? ((taskStats.pending / taskStats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.pending / taskStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Overdue Tasks */}
            {taskStats.overdue > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-gray-700">Overdue</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {taskStats.overdue} ({taskStats.total > 0 ? ((taskStats.overdue / taskStats.total) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${taskStats.total > 0 ? (taskStats.overdue / taskStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">Total Projects</h3>
            <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-800">{projects.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {projects.filter(p => p.status !== 'completed').length} active
          </p>
        </div>

        {(userType === 'developer' || userType === 'project-manager') && (
          <>
            <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Total Tasks</h3>
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-800">{tasks.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {tasks.filter(t => t.status !== 'completed').length} pending
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">{completionRate}% completion</p>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-red-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Overdue</h3>
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {tasks.filter(t => {
                  if (!t.due_date || t.status === 'completed') return false;
                  return new Date(t.due_date) < new Date();
                }).length}
              </p>
            </div>
          </>
        )}

        {userType === 'client' && (
          <>
            <div className="bg-white rounded-lg p-6 border-2 border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">In Progress</h3>
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {projects.filter(p => p.status === 'in_progress').length}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-yellow-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Planning</h3>
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {projects.filter(p => p.status === 'planning').length}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Task Status Progress (for developers and PMs) */}
      {(userType === 'developer' || userType === 'project-manager') && tasks.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Task Progress</h3>
          <div className="space-y-4">
            {[
              { 
                label: 'Completed', 
                count: tasks.filter(t => t.status === 'completed').length,
                color: 'bg-green-500',
                textColor: 'text-green-700'
              },
              { 
                label: 'In Progress', 
                count: tasks.filter(t => t.status === 'in_progress').length,
                color: 'bg-blue-500',
                textColor: 'text-blue-700'
              },
              { 
                label: 'Pending', 
                count: tasks.filter(t => t.status === 'pending' || t.status === 'todo').length,
                color: 'bg-yellow-500',
                textColor: 'text-yellow-700'
              }
            ].map((item, idx) => {
              const percentage = tasks.length > 0 ? (item.count / tasks.length) * 100 : 0;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${item.textColor}`}>{percentage.toFixed(1)}%</span>
                      <span className="text-sm text-gray-500">({item.count})</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`${item.color} h-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
              </svg>
              {userType === 'project-manager' ? 'Managing Projects' : 
               userType === 'client' ? 'Client Projects' : 'Assigned Projects'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{projects.length} total projects</p>
          </div>
        </div>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {projects.map((project) => {
              const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';
              const daysUntilDeadline = project.deadline 
                ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                : null;
              
              return (
                <a
                  key={project.id}
                  href={`/${user?.role === 'admin' ? 'admin' : user?.role === 'project_manager' ? 'manager' : user?.role === 'developer' ? 'developer' : 'client'}/projects/${project.id}`}
                  className="group block bg-gradient-to-br from-gray-50 to-white p-5 rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors mb-1">
                        {project.name || project.title}
                      </h3>
                      {project.description && (
                        <div 
                          className="text-sm text-gray-600 line-clamp-2 mb-2"
                          dangerouslySetInnerHTML={{ __html: project.description }}
                        />
                      )}
                    </div>
                    <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      project.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-300' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                      project.status === 'planning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                      'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                    {project.deadline && (
                      <div className={`flex items-center gap-1 font-semibold ${
                        isOverdue ? 'text-red-600' : 
                        daysUntilDeadline <= 7 ? 'text-orange-600' : 
                        'text-gray-600'
                      }`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                        {isOverdue && <span className="text-xs">(Overdue)</span>}
                        {!isOverdue && daysUntilDeadline <= 7 && daysUntilDeadline > 0 && (
                          <span className="text-xs">({daysUntilDeadline}d left)</span>
                        )}
                      </div>
                    )}
                    {project.members && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                        <span className="font-medium">{project.members?.length || 0} members</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {project.progress !== undefined && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">Progress</span>
                        <span className="font-bold text-gray-800">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.progress === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            project.progress >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            project.progress >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                            'bg-gradient-to-r from-orange-500 to-orange-600'
                          }`}
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
            </svg>
            <p className="text-gray-500 font-medium">No projects found</p>
          </div>
        )}
      </div>

      {/* Recent Tasks (for developers and PMs) */}
      {(userType === 'developer' || userType === 'project-manager') && tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5" style={{color: 'rgb(89, 86, 157)'}} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
                Recent Tasks
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{tasks.length} total tasks</p>
            </div>
          </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {tasks.slice(0, 9).map((task) => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
              const daysUntilDue = task.due_date 
                ? Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24))
                : null;
              
              return (
                <div
                  key={task.id}
                  className="group bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          isOverdue ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {task.title || task.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {task.description && (
                    <div 
                      className="text-xs text-gray-600 mb-2.5 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: task.description }}
                    />
                  )}
                  
                  <div className="space-y-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                      task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                    
                    {task.due_date && (
                      <div className={`flex items-center gap-1 text-xs font-medium ${
                        isOverdue ? 'text-red-600' :
                        daysUntilDue <= 3 ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        {isOverdue && <span className="text-xs font-semibold">(OVERDUE)</span>}
                        {!isOverdue && daysUntilDue <= 3 && daysUntilDue >= 0 && (
                          <span className="text-xs">({daysUntilDue}d left)</span>
                        )}
                      </div>
                    )}

                    {task.priority && (
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-50 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {task.priority === 'high' && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                            </svg>
                          )}
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {tasks.length > 9 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Showing 9 of {tasks.length} tasks
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetails;
