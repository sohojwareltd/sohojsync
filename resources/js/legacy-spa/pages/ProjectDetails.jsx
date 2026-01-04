import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

const PRIMARY_COLOR = 'rgb(89, 86, 157)';

/**
 * Project Details Page
 * Enhanced with analytics, charts, deadline alerts, and chat functionality
 */
const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    onHold: 0
  });

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectTasks();
    fetchAnalytics();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}`);
      setProject(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      // Create mock analytics if endpoint doesn't exist
      setAnalytics({
        todaysPendingTasks: 0,
        overdueTasks: 0,
        clientProjectCount: 1,
        userPendingTaskRatio: 0
      });
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/tasks`);
      const taskList = response.data.data || response.data || [];
      setTasks(taskList);
      
      // Calculate statistics
      const stats = {
        total: taskList.length,
        completed: taskList.filter(t => t.status === 'completed').length,
        inProgress: taskList.filter(t => t.status === 'in_progress').length,
        pending: taskList.filter(t => t.status === 'pending').length,
        onHold: taskList.filter(t => t.status === 'on_hold').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const isDeadlineOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const startChatConversation = (userId, userName) => {
    const rolePrefix = getRolePrefix();
    navigate(`${rolePrefix}/chat?user=${userId}&name=${encodeURIComponent(userName)}`);
  };

  const getRolePrefix = () => {
    switch (user?.role) {
      case 'admin': return '/admin';
      case 'project_manager': return '/manager';
      case 'developer': return '/developer';
      case 'client': return '/client';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500',
      in_progress: 'bg-blue-500',
      pending: 'bg-yellow-500',
      on_hold: 'bg-orange-500',
      planning: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      completed: 'bg-green-50 text-green-800 border-green-200',
      in_progress: 'bg-blue-50 text-blue-800 border-blue-200',
      pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      on_hold: 'bg-orange-50 text-orange-800 border-orange-200',
      planning: 'bg-gray-50 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-800 border-gray-200';
  };

  if (loading) {
    return <Loader />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <button 
          onClick={() => navigate(`${getRolePrefix()}/projects`)}
          className="mt-4 px-4 py-2 text-white rounded-lg"
          style={{background: 'rgb(155 2 50 / 76%)'}}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const progress = getProgressPercentage();
  const daysUntil = getDaysUntilDeadline(project?.deadline);
  const isOverdue = isDeadlineOverdue(project?.deadline);
  const rolePrefix = getRolePrefix();
  const todaysPending = tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-5" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* Deadline Alert Banner */}
      {project?.deadline && (
        <div className={`rounded-[12px] p-5 border-l-4 ${
          isOverdue 
            ? 'bg-red-50 border-red-500' 
            : daysUntil <= 3 
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-blue-50 border-blue-500'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isOverdue ? 'bg-red-100' : daysUntil <= 3 ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              <svg className={`w-6 h-6 ${
                isOverdue ? 'text-red-600' : daysUntil <= 3 ? 'text-yellow-600' : 'text-blue-600'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${
                isOverdue ? 'text-red-800' : daysUntil <= 3 ? 'text-yellow-800' : 'text-blue-800'
              }`}>
                {isOverdue 
                  ? '⚠️ Deadline Overdue!' 
                  : daysUntil <= 3 
                    ? '⏰ Deadline Approaching!' 
                    : '📅 Upcoming Deadline'}
              </h3>
              <p className={`text-sm ${
                isOverdue ? 'text-red-700' : daysUntil <= 3 ? 'text-yellow-700' : 'text-blue-700'
              }`}>
                Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {!isOverdue && ` (${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} remaining)`}
                {isOverdue && ` (${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'day' : 'days'} overdue)`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link
              to={`${rolePrefix}/projects`}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Projects
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">{project.name || project.title}</h1>
            {project.description && (
              <div 
                className="text-gray-600 mt-2" 
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            )}
          </div>
          <span
            className="px-3 py-1 rounded-lg text-sm font-semibold border border-gray-200"
            style={{ color: PRIMARY_COLOR, background: '#f5f3ff' }}
          >
            {project.status.replace('_', ' ')}
          </span>
        </div>

        {/* Project Info Grid with Highlighted PM and Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {project.project_manager && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <a
                href={`${rolePrefix}/users/project-manager/${project.project_manager.id}`}
                className="block group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Project Manager</p>
                </div>
                <p className="text-lg font-extrabold text-purple-700 mb-1 group-hover:text-purple-900 group-hover:underline">{project.project_manager.name}</p>
                <p className="text-xs text-gray-500">{project.project_manager.email}</p>
              </a>
              <button
                onClick={(e) => { e.preventDefault(); startChatConversation(project.project_manager.id, project.project_manager.name); }}
                className="mt-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 rounded text-xs text-purple-700 font-semibold flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                </svg>
                Chat
              </button>
            </div>
          )}
          {project.client && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <a
                href={`${rolePrefix}/users/client/${project.client.id}`}
                className="block group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Client</p>
                </div>
                <p className="text-lg font-extrabold text-blue-700 mb-1 group-hover:text-blue-900 group-hover:underline">{project.client.name}</p>
                <p className="text-xs text-gray-500">{project.client.email}</p>
              </a>
              <button
                onClick={(e) => { e.preventDefault(); startChatConversation(project.client.id, project.client.name); }}
                className="mt-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs text-blue-700 font-semibold flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                </svg>
                Chat
              </button>
            </div>
          )}
          {project.deadline && (
            <div className="p-4 rounded-lg border border-gray-200 bg-white">
              <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1 uppercase tracking-wide">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                Deadline
              </p>
              <p className="text-base font-bold text-gray-900">{new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-xs mt-1 font-medium text-gray-600">
                {isOverdue ? `${Math.abs(daysUntil)} days overdue` : daysUntil <= 0 ? 'Today!' : `${daysUntil} days left`}
              </p>
            </div>
          )}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 font-semibold mb-1">TEAM SIZE</p>
            <p className="text-sm font-semibold text-gray-800">{project.members?.length || 0} Developer{(project.members?.length || 0) !== 1 ? 's' : ''}</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics?.clientProjectCount || 1} project{(analytics?.clientProjectCount || 1) !== 1 ? 's' : ''} for this client
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600">Total Tasks</h3>
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600">Pending Tasks</h3>
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending + stats.inProgress}</p>
          <p className="text-xs text-gray-500 mt-1">{todaysPending} due today</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600">Completed</h3>
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-xs text-gray-500 mt-1">{progress}% completion</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600">Overdue</h3>
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics?.overdueTasks || 0}</p>
        </div>
      </div>

      {/* Progress Overview with Visual Charts */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Project Progress & Analytics</h2>
        
        <div className="space-y-6">
          {/* Main Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
              <span className="text-2xl font-bold text-purple-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 h-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.completed} of {stats.total} tasks completed</p>
          </div>

          {/* Task Status Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: stats.total, icon: '📊' },
              { label: 'Completed', value: stats.completed, icon: '✅' },
              { label: 'In Progress', value: stats.inProgress, icon: '🔄' },
              { label: 'Pending', value: stats.pending, icon: '⏳' },
              { label: 'On Hold', value: stats.onHold, icon: '⏸️' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Visual Status Distribution Chart */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
              Status Distribution
            </h3>
            <div className="space-y-3">
              {[
                { status: 'completed', label: 'Completed', count: stats.completed, color: 'bg-green-500' },
                { status: 'in_progress', label: 'In Progress', count: stats.inProgress, color: 'bg-blue-500' },
                { status: 'pending', label: 'Pending', count: stats.pending, color: 'bg-yellow-500' },
                { status: 'on_hold', label: 'On Hold', count: stats.onHold, color: 'bg-orange-500' }
              ].map((item, idx) => {
                const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                        <span className="text-sm font-semibold text-gray-800 w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className={`${item.color} h-full transition-all duration-500 relative`}
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white opacity-20"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Analytics */}
          {project.members && project.members.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: PRIMARY_COLOR }}>
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                Team Members
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.members.map((member, idx) => {
                  const memberTasks = tasks.filter(t => t.assigned_to?.id === member.user_id);
                  const memberPending = memberTasks.filter(t => t.status !== 'completed').length;
                  const memberCompleted = memberTasks.filter(t => t.status === 'completed').length;
                  const memberRatio = memberTasks.length > 0 ? ((memberCompleted / memberTasks.length) * 100).toFixed(0) : 0;
                  
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: PRIMARY_COLOR }}>
                          {(member.user?.name || 'D').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <a 
                            href={`${rolePrefix}/users/developer/${member.user_id}`}
                            className="font-semibold text-gray-900 text-sm truncate hover:text-purple-700 block"
                          >
                            {member.user?.name || 'Developer'}
                          </a>
                          <p className="text-xs text-gray-500">{memberTasks.length} task{memberTasks.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); startChatConversation(member.user_id, member.user?.name); }}
                          className="p-2 rounded-lg transition-colors border border-gray-200 hover:border-purple-300 hover:bg-purple-50 flex-shrink-0"
                          title="Send Message"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: PRIMARY_COLOR }}>
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ width: `${memberRatio}%`, background: PRIMARY_COLOR }}
                            ></div>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-700 text-xs">{memberRatio}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-gray-500">
                          <span className="text-green-600 font-semibold">{memberCompleted}</span> done
                        </span>
                        <span className="text-gray-500">
                          <span className="text-yellow-600 font-semibold">{memberPending}</span> pending
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Today's Pending Tasks Alert */}
      {todaysPending > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">⚡ {todaysPending} Task{todaysPending !== 1 ? 's' : ''} Due Today!</h3>
              <p className="text-sm text-yellow-700">You have pending tasks that need attention today.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Tasks ({tasks.length})</h2>
        </div>
        
        {tasks.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {tasks.map((task, idx) => (
              <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800">{task.title || task.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBgColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  {task.assigned_to && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                      {task.assigned_to.name}
                    </span>
                  )}
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  {task.priority && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No tasks yet for this project</p>
            <a
              href={`${rolePrefix}/projects/${projectId}/tasks`}
              className="mt-3 inline-block px-4 py-2 text-white rounded-lg text-sm"
              style={{background: 'rgb(155 2 50 / 76%)'}}
            >
              Create Task
            </a>
          </div>
        )}
      </div>

      {/* Project Attachments */}
      {project.attachments && project.attachments.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Project Attachments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.attachments.map((attachment) => (
              <div 
                key={attachment.id} 
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{attachment.file_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(attachment.file_size / 1024).toFixed(2)} KB
                      {attachment.created_at && ` • ${new Date(attachment.created_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <a
                  href={`${axiosInstance.defaults.baseURL.replace('/api', '')}/${attachment.file_path}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members */}
      {project.members && project.members.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Team Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {project.members.map((member, idx) => (
              <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
                <p className="text-xs text-purple-600 font-medium mt-1 capitalize">{member.role?.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
