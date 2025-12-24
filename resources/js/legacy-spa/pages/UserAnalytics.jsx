import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

/**
 * User Analytics Page
 * Shows project manager/developer analytics, tasks, and work history
 */
const UserAnalytics = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    emergencyTasks: 0,
    onHoldTasks: 0,
    todayCompletedTasks: 0
  });

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user details
      const userResponse = await axiosInstance.get(`/users/${userId}`);
      setUser(userResponse.data.data || userResponse.data);
      
      // Fetch user's projects
      const projectResponse = await axiosInstance.get(`/users/${userId}/projects`);
      const projectList = projectResponse.data.data || projectResponse.data || [];
      setProjects(projectList);
      
      // Fetch user's tasks
      const taskResponse = await axiosInstance.get(`/users/${userId}/tasks`);
      const taskList = taskResponse.data.data || taskResponse.data || [];
      setTasks(taskList);
      
      // Calculate statistics
      const today = new Date().toISOString().split('T')[0];
      const todayCompleted = taskList.filter(t => 
        t.status === 'completed' && 
        t.updated_at && 
        t.updated_at.startsWith(today)
      ).length;
      
      setStats({
        totalTasks: taskList.length,
        completedTasks: taskList.filter(t => t.status === 'completed').length,
        pendingTasks: taskList.filter(t => t.status === 'pending').length,
        emergencyTasks: taskList.filter(t => t.priority === 'high' || t.priority === 'critical').length,
        onHoldTasks: taskList.filter(t => t.status === 'on_hold').length,
        todayCompletedTasks: todayCompleted
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!user) return <div className="p-6 text-center">User not found</div>;

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const emergencyTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'critical');

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'on_hold': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-5" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* Header */}
      <div className="bg-white rounded-[12px] p-6 shadow-sm border" style={{borderColor: '#e9ecef'}}>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-600 text-sm">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 capitalize">
                {user.role?.replace('_', ' ')}
              </span>
              {user.department && (
                <span className="text-sm text-gray-600">
                  Department: {user.department}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold mb-1">TOTAL TASKS</p>
          <p className="text-3xl font-bold text-blue-700">{stats.totalTasks}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 font-semibold mb-1">COMPLETED</p>
          <p className="text-3xl font-bold text-green-700">{stats.completedTasks}</p>
          <p className="text-xs text-green-600 mt-1">{Math.round((stats.completedTasks/stats.totalTasks)*100) || 0}%</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-yellow-600 font-semibold mb-1">PENDING</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.pendingTasks}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-red-600 font-semibold mb-1">EMERGENCY</p>
          <p className="text-3xl font-bold text-red-700">{stats.emergencyTasks}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <p className="text-xs text-orange-600 font-semibold mb-1">ON HOLD</p>
          <p className="text-3xl font-bold text-orange-700">{stats.onHoldTasks}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold mb-1">TODAY DONE</p>
          <p className="text-3xl font-bold text-purple-700">{stats.todayCompletedTasks}</p>
        </div>
      </div>

      {/* Projects Assigned */}
      {projects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Projects ({projects.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {projects.map(project => (
              <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{project.name || project.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{project.client?.name}</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-medium text-white" style={{background: project.status === 'completed' ? 'rgb(107, 114, 128)' : '#F25292'}}>
                    {project.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency/High Priority Tasks */}
      {emergencyTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-red-300 overflow-hidden">
          <div className="p-6 border-b border-red-200 bg-red-50">
            <h2 className="text-lg font-bold text-red-800">🚨 Emergency Tasks ({emergencyTasks.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {emergencyTasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-4 hover:bg-red-50 transition-colors border-l-4 border-red-500">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{task.project?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {task.deadline && (
                  <p className="text-xs text-gray-500">
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
            {emergencyTasks.length > 5 && (
              <div className="p-4 text-center text-sm text-gray-600">
                +{emergencyTasks.length - 5} more emergency tasks
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Active Tasks ({pendingTasks.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingTasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{task.project?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.priority && (
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {task.deadline && (
                  <p className="text-xs text-gray-500">
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Completed ({completedTasks.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {completedTasks.slice(0, 10).map(task => (
              <div key={task.id} className="p-4 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700 line-through">{task.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{task.project?.name}</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                    ✓ Done
                  </span>
                </div>
              </div>
            ))}
            {completedTasks.length > 10 && (
              <div className="p-4 text-center text-sm text-gray-600">
                +{completedTasks.length - 10} more completed tasks
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;
