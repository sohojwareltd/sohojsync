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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-500">Here's your workspace overview</p>
      </div>

      {/* Stats Grid - Smaller */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const borderColors = ['border-l-purple-500', 'border-l-pink-500', 'border-l-rose-500', 'border-l-emerald-500'];
          const iconBgColors = ['bg-purple-50', 'bg-pink-50', 'bg-rose-50', 'bg-emerald-50'];
          const iconTextColors = ['text-purple-600', 'text-pink-600', 'text-rose-600', 'text-emerald-600'];
          const textColors = ['text-purple-600', 'text-pink-600', 'text-rose-600', 'text-emerald-600'];
          
          return (
            <div
              key={index}
              className={`bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all border-l-4 ${borderColors[index]}`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${iconBgColors[index]} mb-2`}>
                <span className={`text-xl ${iconTextColors[index]}`}>{card.icon}</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{card.title}</p>
              <p className={`text-2xl font-bold ${textColors[index]}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid - Chart and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span> Task Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-l-4 border-rose-500 bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Open Tasks</p>
              <p className="text-3xl font-bold text-rose-600">{stats.openTasks}</p>
              <div className="mt-2 w-full bg-rose-100 rounded-full h-2">
                <div 
                  className="bg-rose-500 h-2 rounded-full" 
                  style={{width: `${stats.totalTasks > 0 ? (stats.openTasks / stats.totalTasks) * 100 : 0}%`}}
                ></div>
              </div>
            </div>

            <div className="p-4 border-l-4 border-purple-500 bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg">
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-purple-600">
                {allTasks.filter(t => t.status === 'in_progress').length}
              </p>
              <div className="mt-2 w-full bg-purple-100 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{width: `${stats.totalTasks > 0 ? (allTasks.filter(t => t.status === 'in_progress').length / stats.totalTasks) * 100 : 0}%`}}
                ></div>
              </div>
            </div>

            <div className="p-4 border-l-4 border-emerald-500 bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.completedTasks}</p>
              <div className="mt-2 w-full bg-emerald-100 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full" 
                  style={{width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Calendar */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span> Calendar
          </h2>
          
          <div className="space-y-4">
            {/* Current Month */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
              
              {(() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const days = [];
                
                // Empty cells for days before month starts
                for (let i = 0; i < firstDay; i++) {
                  days.push(<div key={`empty-${i}`} className="py-2"></div>);
                }
                
                // Days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  const isToday = day === today.getDate();
                  days.push(
                    <div 
                      key={day} 
                      className={`py-2 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors ${
                        isToday 
                          ? 'bg-purple-500 text-white font-bold hover:bg-purple-600' 
                          : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </div>
                  );
                }
                
                return days;
              })()}
            </div>

            {/* Upcoming Events Placeholder */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Events</h4>
              <div className="space-y-2">
                <div className="p-2 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-xs font-medium text-gray-800">Team Meeting</p>
                  <p className="text-xs text-gray-500">Tomorrow, 10:00 AM</p>
                </div>
                <div className="p-2 bg-pink-50 rounded-lg border-l-4 border-pink-500">
                  <p className="text-xs font-medium text-gray-800">Project Deadline</p>
                  <p className="text-xs text-gray-500">Dec 15, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects & Tasks Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📁</span> Recent Projects
            </h2>
            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
              {allProjects.length}
            </span>
          </div>

          <div className="space-y-3">
            {allProjects && allProjects.length > 0 ? (
              allProjects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="p-4 border-l-4 border-l-purple-400 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{project.title || project.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>📋 {allTasks.filter(t => t.project_id === project.id).length} tasks</span>
                  <span>📅 {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
            ) : (
              <p className="text-center text-gray-500 py-4">No projects available</p>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📋</span> Recent Tasks
            </h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium">
                {stats.openTasks} Open
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                {stats.completedTasks} Done
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {allTasks.slice(0, 8).map((task) => (
              <div
                key={task.id}
                className="p-4 border-l-4 border-l-pink-400 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    task.status === 'done' ? 'bg-green-500' : 
                    task.status === 'in_progress' ? 'bg-blue-500' : 'bg-orange-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 mb-1">{task.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        task.status === 'done' ? 'bg-green-100 text-green-700' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Projects - Grid and Table View */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📁</span> All Projects
          </h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
              {allProjects.length} Projects
            </span>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setStats(prev => ({...prev, viewMode: 'grid'}))}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  (stats.viewMode || 'grid') === 'grid'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
              <button
                onClick={() => setStats(prev => ({...prev, viewMode: 'table'}))}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  (stats.viewMode || 'grid') === 'table'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {(stats.viewMode || 'grid') === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProjects.map((project, idx) => {
              const borderColors = ['border-t-purple-500', 'border-t-pink-500', 'border-t-indigo-500'];
              const iconBgColors = ['bg-purple-50', 'bg-pink-50', 'bg-indigo-50'];
              const iconTextColors = ['text-purple-600', 'text-pink-600', 'text-indigo-600'];
              
              return (
                <div
                  key={project.id}
                  className={`bg-gradient-to-br from-white to-gray-50 border border-gray-200 border-t-4 ${borderColors[idx % 3]} rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${iconBgColors[idx % 3]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <svg className={`w-5 h-5 ${iconTextColors[idx % 3]}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                          {project.name}
                        </h3>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                        </svg>
                        {allTasks.filter(t => t.project_id === project.id).length}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <button className={`p-1.5 rounded-lg ${iconBgColors[idx % 3]} ${iconTextColors[idx % 3]} hover:scale-110 transition-transform`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {(stats.viewMode || 'grid') === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Tasks</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {allProjects.map((project, idx) => {
                  const rowColors = ['bg-purple-50', 'bg-pink-50', 'bg-indigo-50'];
                  const borderColors = ['border-l-purple-500', 'border-l-pink-500', 'border-l-indigo-500'];
                  
                  return (
                    <tr 
                      key={project.id} 
                      className={`border-b border-gray-100 hover:${rowColors[idx % 3]} transition-colors cursor-pointer group`}
                    >
                      <td className={`py-4 px-4 border-l-4 ${borderColors[idx % 3]}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${rowColors[idx % 3]} flex items-center justify-center`}>
                            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                            {project.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">
                        {project.description}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {allTasks.filter(t => t.project_id === project.id).length}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-500">
                        {new Date(project.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
