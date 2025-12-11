import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

/**
 * Minimalistic Admin Dashboard
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    openTasks: 0,
    completedTasks: 0,
    totalUsers: 3,
  });
  const [allProjects, setAllProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        axiosInstance.get('/api/projects'),
        axiosInstance.get('/api/tasks'),
      ]);

      // Handle paginated response
      const projects = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data.data || []);
      const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data.data || []);

      setAllProjects(projects);
      setAllTasks(tasks);

      setStats({
        totalProjects: projects.length,
        totalTasks: tasks.length,
        openTasks: tasks.filter(t => t.status === 'open').length,
        completedTasks: tasks.filter(t => t.status === 'done').length,
        totalUsers: 3,
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      bgColor: 'from-[#4a3a5e] to-[#b56e84]',
    },
    {
      title: 'Active Projects',
      value: stats.totalProjects,
      icon: '📁',
      bgColor: 'from-[#b56e84] to-[#d48ba6]',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: '📋',
      bgColor: 'from-[#d48ba6] to-[#e5a3bf]',
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: '✓',
      bgColor: 'from-[#8b7355] to-[#a89968]',
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Welcome Header */}
      <div className="mb-3">
        <h1 className="text-xl font-semibold text-gray-800">Welcome back, {user?.name}!</h1>
        <p className="text-sm text-gray-500">Here's your workspace overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow" style={{borderColor: '#e5e7eb', borderTopColor: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)', borderTopWidth: '3px'}}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-600">Users</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>

        <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow" style={{borderColor: '#e5e7eb', borderTopColor: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)', borderTopWidth: '3px'}}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Projects</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.totalProjects}</p>
        </div>

        <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow" style={{borderColor: '#e5e7eb', borderTopColor: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)', borderTopWidth: '3px'}}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Tasks</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.totalTasks}</p>
        </div>

        <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow" style={{borderColor: '#e5e7eb', borderTopColor: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)', borderTopWidth: '3px'}}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Done</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.completedTasks}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task Overview */}
        <div className="bg-white border rounded-lg shadow-sm" style={{borderColor: '#e5e7eb'}}>
          <div className="border-b p-3 flex items-center justify-between" style={{borderColor: '#e5e7eb'}}>
            <h3 className="text-base font-semibold text-gray-800">Task Overview</h3>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-sm font-medium">
              {allTasks.length} tasks
            </span>
          </div>
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {allTasks.slice(0, 8).map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border hover:shadow-sm transition-shadow"
                style={{borderColor: '#e5e7eb'}}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-base font-medium text-gray-800 flex-1">{task.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                    task.status === 'done' 
                      ? 'text-white' 
                      : 'text-white'
                  }`}
                  style={{background: task.status === 'done' ? 'rgb(107, 114, 128)' : '#F25292'}}>
                    {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'Progress' : 'Open'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                    </svg>
                    {task.project?.title || 'No project'}
                  </span>
                  {task.priority && (
                    <span className="px-1.5 py-0.5 rounded text-xs text-white" style={{background: 'rgb(75, 85, 99)'}}>
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white border rounded-lg shadow-sm" style={{borderColor: '#e5e7eb'}}>
          <div className="border-b p-3" style={{borderColor: '#e5e7eb'}}>
            <h3 className="text-base font-semibold text-gray-800">Calendar</h3>
          </div>
          <div className="p-4">
            <div className="text-center mb-3">
              <p className="text-sm font-semibold text-gray-700">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const days = [];
                
                for (let i = 0; i < firstDay; i++) {
                  days.push(<div key={`empty-${i}`} className="py-2"></div>);
                }
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const isToday = day === today.getDate();
                  days.push(
                    <div 
                      key={day} 
                      className={`text-center text-sm p-1.5 rounded ${
                        isToday 
                          ? 'text-white font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      style={isToday ? {background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'} : {}}
                    >
                      {day}
                    </div>
                  );
                }
                
                return days;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
