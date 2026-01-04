import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';

const PRIMARY_COLOR = 'rgb(89, 86, 157)';

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
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back, {user?.name}!</h1>
            <p className="text-sm text-gray-500">Overview for today</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded border border-gray-200 text-xs font-semibold text-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
            <span>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 rounded-full" style={{background: PRIMARY_COLOR}}></div>
          <h2 className="text-sm font-semibold text-gray-900">Quick Stats</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{
            label: 'Total Projects',
            value: stats.totalProjects,
            icon: (
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
            )
          }, {
            label: 'Total Tasks',
            value: stats.totalTasks,
            icon: (
              <>
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </>
            )
          }, {
            label: 'Open Tasks',
            value: stats.openTasks,
            icon: (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            )
          }, {
            label: 'Completed',
            value: stats.completedTasks,
            icon: (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            )
          }].map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{background: PRIMARY_COLOR}}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {item.icon}
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1 font-medium">{item.label}</p>
              <p className="text-xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 rounded-full" style={{background: PRIMARY_COLOR}}></div>
          <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Projects */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{background: PRIMARY_COLOR}}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900">Recent Projects</h3>
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              {recentProjects.length > 0 ? (
                recentProjects.map(project => (
                  <div key={project.id} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1" >{project.title || project.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        project.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                        project.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {project.status?.replace('_', ' ').toUpperCase()}
                      </span>
                      {project.deadline && (
                        <span className="text-xs text-gray-500" >
                          Due: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 font-medium" >No projects yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Task Overview */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{background: PRIMARY_COLOR}}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900">Recent Tasks</h3>
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              {recentTasks.length > 0 ? (
                recentTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 truncate" >{task.title}</h4>
                      <p className="text-xs text-gray-500 truncate" >{task.project?.title}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ml-3 ${
                      task.status === 'done' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {task.status === 'done' ? 'DONE' : 'OPEN'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 font-medium" >No tasks yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{background: PRIMARY_COLOR}}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900">Calendar</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="text-center mb-3">
                <p className="text-sm font-semibold text-gray-900" >
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-[11px] font-semibold text-gray-500 p-1" >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 35 }, (_, i) => {
                  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
                  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                  const day = i - firstDay + 1;
                  const isCurrentMonth = day > 0 && day <= daysInMonth;
                  const isToday = day === new Date().getDate() && isCurrentMonth;
                  
                  return (
                    <div
                      key={i}
                      className={`text-center text-[12px] p-2 rounded font-medium ${
                        isToday 
                          ? 'text-white font-bold' 
                          : isCurrentMonth 
                          ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' 
                          : 'text-gray-300'
                      }`}
                      style={isToday ? {background: PRIMARY_COLOR} : {}}
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
    </div>
  );
};

export default Dashboard;
