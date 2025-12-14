import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';

/**
 * Dashboard Page
 * Main overview page showing stats and recent items
 */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    openTasks: 0,
    completedTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        axiosInstance.get('/projects'),
        axiosInstance.get('/tasks'),
      ]);

      const projects = projectsRes.data;
      const tasks = tasksRes.data;

      setRecentProjects(projects.slice(0, 3));
      setRecentTasks(tasks.slice(0, 5));

      setStats({
        totalProjects: projects.length,
        totalTasks: tasks.length,
        openTasks: tasks.filter(t => t.status === 'open').length,
        completedTasks: tasks.filter(t => t.status === 'done').length,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Welcome back, {user?.name}!</h1>
        <p className="text-xs text-gray-500">Here's your overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border rounded-lg p-3 shadow-sm" style={{borderColor: '#e5e7eb', borderTopColor: '#59569D', borderTopWidth: '3px'}}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: '#59569D'}}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">Projects</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.totalProjects}</p>
        </div>

        <div className="bg-white border rounded-lg p-3 shadow-sm" style={{borderColor: '#e5e7eb', borderTopColor: '#59569D', borderTopWidth: '3px'}}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: '#59569D'}}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.totalTasks}</p>
        </div>

        <div className="bg-white border rounded-lg p-3 shadow-sm" style={{borderColor: '#e5e7eb', borderTopColor: '#59569D', borderTopWidth: '3px'}}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: '#59569D'}}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">Open</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.openTasks}</p>
        </div>

        <div className="bg-white border rounded-lg p-3 shadow-sm" style={{borderColor: '#e5e7eb', borderTopColor: '#59569D', borderTopWidth: '3px'}}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: '#59569D'}}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">Done</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.completedTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task Overview */}
        <div className="bg-white border rounded-lg shadow-sm" style={{borderColor: '#e5e7eb'}}>
          <div className="border-b p-3" style={{borderColor: '#e5e7eb'}}>
            <h3 className="text-sm font-semibold text-gray-800">Task Overview</h3>
          </div>
          <div className="p-4 space-y-2">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-gray-800 truncate">{task.title}</h4>
                    <p className="text-xs text-gray-500 truncate">{task.project?.title}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ml-2 ${
                    task.status === 'done' 
                      ? 'bg-gray-100 text-gray-700' 
                      : 'bg-purple-50 text-purple-700'
                  }`}>
                    {task.status === 'done' ? 'Done' : 'Open'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500">No tasks yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white border rounded-lg shadow-sm" style={{borderColor: '#e5e7eb'}}>
          <div className="border-b p-3" style={{borderColor: '#e5e7eb'}}>
            <h3 className="text-sm font-semibold text-gray-800">Calendar</h3>
          </div>
          <div className="p-4">
            <div className="text-center mb-3">
              <p className="text-xs font-semibold text-gray-700">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
                const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                const day = i - firstDay + 1;
                const isCurrentMonth = day > 0 && day <= daysInMonth;
                const isToday = day === new Date().getDate() && isCurrentMonth;
                
                return (
                  <div
                    key={i}
                    className={`text-center text-xs p-1.5 rounded ${
                      isToday 
                        ? 'text-white font-semibold' 
                        : isCurrentMonth 
                        ? 'text-gray-700 hover:bg-gray-50' 
                        : 'text-gray-300'
                    }`}
                    style={isToday ? {background: '#59569D'} : {}}
                  >
                    {isCurrentMonth ? day : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
