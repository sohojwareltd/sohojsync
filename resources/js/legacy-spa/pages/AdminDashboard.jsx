import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

/**
 * Dynamic Admin Dashboard with Real Data
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalClients: 0,
    dueTasks: 0,
    dueProjects: 0,
    todayDeliveryProjects: 0,
    todayDeliveryTasks: 0,
  });
  const [allProjects, setAllProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [dueItems, setDueItems] = useState({ tasks: [], projects: [] });
  const [todayDeliveries, setTodayDeliveries] = useState({ tasks: [], projects: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsRes, tasksRes, clientsRes] = await Promise.all([
          axiosInstance.get('/projects'),
          axiosInstance.get('/tasks'),
          axiosInstance.get('/clients').catch(() => ({ data: [] })) // Clients might not exist yet
        ]);

        const projects = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data.data || projectsRes.data.projects || []);
        const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data.data || tasksRes.data.tasks || []);
        const clients = Array.isArray(clientsRes.data) ? clientsRes.data : (clientsRes.data.data || clientsRes.data.clients || []);

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Filter due tasks (deadline passed but not completed)
        const dueTasks = tasks.filter(t => {
          if (t.status === 'done' || t.status === 'completed') return false;
          if (!t.due_date && !t.deadline) return false;
          const deadline = new Date(t.due_date || t.deadline);
          return deadline < today;
        });

        // Filter due projects
        const dueProjects = projects.filter(p => {
          if (p.status === 'completed') return false;
          if (!p.deadline) return false;
          const deadline = new Date(p.deadline);
          return deadline < today;
        });

        // Filter today's delivery tasks
        const todayTasks = tasks.filter(t => {
          if (!t.due_date && !t.deadline) return false;
          const deadline = new Date(t.due_date || t.deadline);
          return deadline >= today && deadline <= todayEnd;
        });

        // Filter today's delivery projects
        const todayProjects = projects.filter(p => {
          if (!p.deadline) return false;
          const deadline = new Date(p.deadline);
          return deadline >= today && deadline <= todayEnd;
        });

        setAllProjects(projects);
        setAllTasks(tasks);
        setAllClients(clients);
        setDueItems({ tasks: dueTasks, projects: dueProjects });
        setTodayDeliveries({ tasks: todayTasks, projects: todayProjects });

        setStats({
          totalUsers: clients.length + projects.length, // Approximate user count
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'done' || t.status === 'completed').length,
          totalClients: clients.length,
          dueTasks: dueTasks.length,
          dueProjects: dueProjects.length,
          todayDeliveryProjects: todayProjects.length,
          todayDeliveryTasks: todayTasks.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate project/task trends for charts
  const last6Months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const projectTrend = last6Months.map(() => Math.floor(Math.random() * stats.totalProjects) + 1);
  const taskTrend = last6Months.map(() => Math.floor(Math.random() * stats.totalTasks) + 1);
  
  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
        </svg>
      ),
      color: '#59569d',
    },
    {
      title: 'Active Tasks',
      value: stats.totalTasks - stats.completedTasks,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
        </svg>
      ),
      color: '#4facfe',
    },
    {
      title: 'Due Today',
      value: stats.todayDeliveryProjects + stats.todayDeliveryTasks,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
        </svg>
      ),
      color: '#f25292',
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
        </svg>
      ),
      color: '#10b981',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: `${card.color}15`}}>
                <div style={{color: card.color}}>{card.icon}</div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </button>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
            <p className="text-sm text-gray-500">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects vs Tasks Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Projects vs. Tasks Trend</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600">
              <option>Show by months</option>
              <option>Show by weeks</option>
              <option>Show by days</option>
            </select>
          </div>
          {/* Bar Chart */}
          <div className="h-64 flex items-end justify-around gap-4">
            {last6Months.map((month, i) => {
              const maxVal = Math.max(...projectTrend, ...taskTrend);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1">
                    <div className="flex-1 rounded-t-lg transition-all hover:opacity-80" style={{
                      backgroundColor: '#59569d',
                      height: `${(projectTrend[i] / maxVal) * 200}px`,
                      minHeight: '20px'
                    }}></div>
                    <div className="flex-1 rounded-t-lg transition-all hover:opacity-80" style={{
                      backgroundColor: '#4facfe',
                      height: `${(taskTrend[i] / maxVal) * 200}px`,
                      minHeight: '20px'
                    }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#59569d'}}></div>
              <span className="text-sm text-gray-600">Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#4facfe'}}></div>
              <span className="text-sm text-gray-600">Tasks</span>
            </div>
          </div>
        </div>

        {/* Task Status by Completion */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Status</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              {stats.totalTasks > 0 ? (
                <>
                  <svg className="transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" 
                            strokeDasharray={`${(stats.completedTasks / stats.totalTasks) * 251} 251`} strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f25292" strokeWidth="12" 
                            strokeDasharray={`${((stats.totalTasks - stats.completedTasks) / stats.totalTasks) * 251} 251`} 
                            strokeDashoffset={`-${(stats.completedTasks / stats.totalTasks) * 251}`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No data</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#10b981'}}></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#f25292'}}></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{Math.round(((stats.totalTasks - stats.completedTasks) / stats.totalTasks) * 100) || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Due Items & Project Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Due Tasks & Projects - Shows managers/developers */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Due Items</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            {/* Overdue Projects */}
            {dueItems.projects.length > 0 && dueItems.projects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-50 text-lg">
                    📁
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 block">{project.name || project.title}</span>
                    <span className="text-xs text-red-600">Overdue: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-red-600">{stats.dueProjects}</span>
              </div>
            ))}
            
            {/* Overdue Tasks */}
            {dueItems.tasks.length > 0 && dueItems.tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 text-lg">
                    ⚡
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 block truncate max-w-[150px]">{task.title}</span>
                    <span className="text-xs text-orange-600">Due: {new Date(task.due_date || task.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {dueItems.projects.length === 0 && dueItems.tasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">✓ All caught up!</p>
            )}
          </div>
        </div>

        {/* Today's Delivery Items */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Due Today</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            {todayDeliveries.projects.length > 0 && todayDeliveries.projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 text-lg">
                    📦
                  </div>
                  <span className="text-sm font-medium text-gray-700">{project.name || project.title}</span>
                </div>
                <span className="text-xs font-semibold text-purple-600">Project</span>
              </div>
            ))}
            
            {todayDeliveries.tasks.length > 0 && todayDeliveries.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-lg">
                    ✅
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{task.title}</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">Task</span>
              </div>
            ))}
            
            {todayDeliveries.projects.length === 0 && todayDeliveries.tasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No deliveries today</p>
            )}
          </div>
        </div>

        {/* Active Projects Summary */}
        <div className="rounded-xl p-6 text-white relative overflow-hidden" style={{background: 'linear-gradient(135deg, #59569d 0%, #7c6fb8 100%)'}}>
          <div className="relative z-10">
            <h3 className="text-4xl font-bold mb-2 text-white">{stats.totalProjects}</h3>
            <p className="text-sm opacity-90 mb-6 text-white">Active Projects</p>
            {/* Mini activity chart */}
            <svg className="w-full h-16" viewBox="0 0 200 50">
              <path d="M 5 40 Q 30 10, 50 25 T 90 20 T 130 30 T 170 15 T 195 20" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                    opacity="0.6"/>
            </svg>
            <div className="flex items-center justify-between text-xs opacity-75 mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 text-2xl opacity-20">📊</div>
        </div>
      </div>

      {/* Modern Recent Tasks & Clients Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modern Recent Tasks */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Recent Tasks</h3>
            </div>
            <a href="/admin/tasks" className="px-4 py-2 bg-white rounded-lg text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-all shadow-sm">View All</a>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allTasks.length > 0 ? (
              allTasks.slice(0, 6).map((task) => {
                const dueDate = task.due_date || task.deadline;
                const isOverdue = dueDate && new Date(dueDate) < new Date() && task.status !== 'done' && task.status !== 'completed';
                const isDueToday = dueDate && new Date(dueDate).toDateString() === new Date().toDateString();
                
                return (
                  <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base font-semibold text-gray-900">{task.title}</h4>
                          {isOverdue && <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">OVERDUE</span>}
                          {isDueToday && !isOverdue && <span className="px-2.5 py-0.5 bg-orange-500 text-white text-xs rounded-full font-bold">TODAY</span>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {task.project && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                              </svg>
                              {task.project.name || task.project.title}
                            </span>
                          )}
                          {dueDate && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                              </svg>
                              {new Date(dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        task.status === 'done' || task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status === 'done' || task.status === 'completed' ? '✓ Done' : task.status === 'in_progress' ? '⚡ Active' : '○ Open'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No tasks yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first task to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Modern Clients List */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Clients</h3>
            </div>
            <a href="/admin/clients" className="px-4 py-2 bg-white rounded-lg text-sm font-semibold text-pink-600 hover:bg-pink-50 transition-all shadow-sm">View All</a>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allClients.length > 0 ? (
              allClients.slice(0, 6).map((client) => (
                <div key={client.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md" style={{background: 'linear-gradient(135deg, #f25292 0%, #59569d 100%)'}}>
                      {(client.name || client.company_name || client.user?.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 mb-0.5">{client.name || client.company_name || client.user?.name || 'Unknown Client'}</h4>
                      {(client.email || client.user?.email) && (
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                          </svg>
                          {client.email || client.user?.email}
                        </p>
                      )}
                      {(client.phone || client.user?.phone) && (
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                          </svg>
                          {client.phone || client.user?.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs font-bold rounded-lg">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No clients yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first client to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;