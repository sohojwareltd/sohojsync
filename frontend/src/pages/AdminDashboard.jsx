import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

const PRIMARY_COLOR = 'rgb(89, 86, 157)';

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
    <div className="space-y-4" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* Welcome Header Card */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900 mb-0.5">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs text-gray-500">Workspace overview</p>
          </div>
          <div className="px-2.5 py-1 rounded border border-gray-200 text-[11px] font-semibold text-gray-700">
            <p className="uppercase tracking-wide">Admin Panel</p>
            <p>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 rounded-full" style={{background: PRIMARY_COLOR}}></div>
        <h2 className="text-sm font-semibold text-gray-900">Quick Stats</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[{
          title: 'Total Users',
          value: stats.totalUsers,
          icon: (
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          )
        }, {
          title: 'Active Projects',
          value: stats.totalProjects,
          icon: (
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
          )
        }, {
          title: 'Total Tasks',
          value: stats.totalTasks,
          icon: (
            <>
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </>
          )
        }, {
          title: 'Completed',
          value: stats.completedTasks,
          icon: (
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          )
        }].map((card, idx) => (
          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{background: PRIMARY_COLOR}}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  {card.icon}
                </svg>
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{card.value}</p>
            <p className="text-[11px] text-gray-600 font-medium">{card.title}</p>
          </div>
        ))}
      </div>

      {/* System Activity Section */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 rounded-full" style={{background: PRIMARY_COLOR}}></div>
        <h2 className="text-sm font-semibold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>System Activity</h2>
      </div>

      {/* Main Content Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-3 py-2.5 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{background: PRIMARY_COLOR}}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>Recent Projects</h3>
            </div>
          </div>
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            {allProjects.length > 0 ? (
              allProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 flex-1" style={{fontFamily: 'Inter, sans-serif'}}>
                      {project.name || project.title}
                    </h4>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${
                      project.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      project.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`} style={{fontFamily: 'Inter, sans-serif'}}>
                      {project.status === 'completed' ? 'DONE' : project.status === 'in_progress' ? 'ACTIVE' : 'PLANNING'}
                    </span>
                  </div>
                  {project.deadline && (
                    <p className="text-[11px] text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>
                      Due: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                </div>
                <p className="text-xs text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>No projects yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Overview */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-3 py-2.5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{background: PRIMARY_COLOR}}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>Recent Tasks</h3>
              </div>
              <a href="/admin/tasks" className="text-[11px] font-semibold" style={{color: PRIMARY_COLOR, fontFamily: 'Inter, sans-serif'}}>View All</a>
            </div>
          </div>
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            {allTasks.length > 0 ? (
              allTasks.slice(0, 6).map((task) => (
                <div key={task.id} className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 flex-1" style={{fontFamily: 'Inter, sans-serif'}}>
                      {task.title}
                    </h4>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${
                      task.status === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`} style={{fontFamily: 'Inter, sans-serif'}}>
                      {task.status === 'done' ? 'DONE' : task.status === 'in_progress' ? 'PROGRESS' : 'OPEN'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                      </svg>
                      {task.project?.title || task.project?.name || 'No project'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="text-xs text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>No tasks yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-3 py-2.5 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{background: PRIMARY_COLOR}}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>Calendar</h3>
            </div>
          </div>
          <div className="p-3">
            <div className="text-center mb-2.5">
              <p className="text-sm font-semibold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[11px] font-semibold text-gray-500 p-1" style={{fontFamily: 'Inter, sans-serif'}}>
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
                      className={`text-center text-[12px] p-2 rounded font-medium ${
                        isToday 
                          ? 'text-white font-bold' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      style={isToday ? {background: PRIMARY_COLOR, fontFamily: 'Inter, sans-serif'} : {fontFamily: 'Inter, sans-serif'}}
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
