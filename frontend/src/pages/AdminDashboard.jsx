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
        axiosInstance.get('/projects'),
        axiosInstance.get('/tasks'),
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
    <div className="space-y-6" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* Welcome Header Card */}
      <div className="bg-white rounded-[16px] p-6 shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-gray-500">Here's your workspace overview</p>
          </div>
          <div className="px-4 py-2 bg-purple-50 rounded-[10px] border border-purple-100">
            <p className="text-xs font-bold text-purple-600 uppercase">Admin Panel</p>
            <p className="text-sm font-semibold text-purple-900">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 rounded-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}></div>
        <h2 className="text-base font-bold text-gray-900">Quick Stats</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-[16px] p-7 shadow-md border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-[16px] p-7 shadow-md border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
              </svg>
            </div>
          </div>
          <p className="text-[36px] font-bold text-gray-900 mb-1" style={{fontFamily: 'Inter, sans-serif'}}>{stats.totalProjects}</p>
          <p className="text-[14px] text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>Active Projects</p>
        </div>

        {/* Total Tasks */}
        <div className="bg-white rounded-[16px] p-7 shadow-md border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <p className="text-[36px] font-bold text-gray-900 mb-1" style={{fontFamily: 'Inter, sans-serif'}}>{stats.totalTasks}</p>
          <p className="text-[14px] text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>Total Tasks</p>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white rounded-[16px] p-7 shadow-md border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <p className="text-[36px] font-bold text-gray-900 mb-1" style={{fontFamily: 'Inter, sans-serif'}}>{stats.completedTasks}</p>
          <p className="text-[14px] text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>Completed Tasks</p>
        </div>
      </div>

      {/* System Activity Section */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 rounded-full" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}></div>
        <h2 className="text-[20px] font-bold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>System Activity</h2>
      </div>

      {/* Main Content Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-[16px] shadow-md border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                </svg>
              </div>
              <h3 className="text-[18px] font-bold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>Recent Projects</h3>
            </div>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {allProjects.length > 0 ? (
              allProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-4 rounded-[10px] border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-[15px] font-semibold text-gray-900 flex-1" style={{fontFamily: 'Inter, sans-serif'}}>
                      {project.name || project.title}
                    </h4>
                    <span className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold flex-shrink-0 ${
                      project.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`} style={{fontFamily: 'Inter, sans-serif'}}>
                      {project.status === 'completed' ? 'DONE' : project.status === 'in_progress' ? 'ACTIVE' : 'PLANNING'}
                    </span>
                  </div>
                  {project.deadline && (
                    <p className="text-[13px] text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>
                      Due: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                </div>
                <p className="text-[14px] text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>No projects yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Overview */}
        <div className="bg-white rounded-[16px] shadow-md border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-[18px] font-bold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>Recent Tasks</h3>
              </div>
              <a href="/admin/tasks" className="text-[13px] font-semibold text-purple-600 hover:text-purple-800" style={{fontFamily: 'Inter, sans-serif'}}>View All</a>
            </div>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {allTasks.length > 0 ? (
              allTasks.slice(0, 6).map((task) => (
                <div key={task.id} className="p-4 rounded-[10px] border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-[15px] font-semibold text-gray-900 flex-1" style={{fontFamily: 'Inter, sans-serif'}}>
                      {task.title}
                    </h4>
                    <span className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold flex-shrink-0 ${
                      task.status === 'done' ? 'bg-green-100 text-green-700 border border-green-200' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`} style={{fontFamily: 'Inter, sans-serif'}}>
                      {task.status === 'done' ? 'DONE' : task.status === 'in_progress' ? 'PROGRESS' : 'OPEN'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                      </svg>
                      {task.project?.title || task.project?.name || 'No project'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-pink-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="text-[14px] text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>No tasks yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-[16px] shadow-md border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-[18px] font-bold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>Calendar</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center mb-4">
              <p className="text-[15px] font-semibold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[11px] font-bold text-gray-500 p-2" style={{fontFamily: 'Inter, sans-serif'}}>
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
                      className={`text-center text-[13px] p-2 rounded-[8px] cursor-pointer transition-all ${
                        isToday 
                          ? 'text-white font-bold shadow-md' 
                          : 'text-gray-700 hover:bg-gray-100 font-medium'
                      }`}
                      style={isToday ? {background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', fontFamily: 'Inter, sans-serif'} : {fontFamily: 'Inter, sans-serif'}}
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
