import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

/**
 * Project Details Page
 * Full project analysis with charts, progress, and task breakdown
 */
const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
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
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}`);
      setProject(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
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
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 text-white rounded-lg"
          style={{background: 'rgb(155 2 50 / 76%)'}}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const progress = getProgressPercentage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Projects
            </button>
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
          <span className="px-3 py-1 rounded-lg text-sm font-medium text-white" style={{background: project.status === 'completed' ? 'rgb(107, 114, 128)' : '#F25292'}}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        {/* Project Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {project.project_manager && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">PROJECT MANAGER</p>
              <p className="text-sm font-semibold text-gray-800">{project.project_manager.name}</p>
              <p className="text-xs text-gray-500">{project.project_manager.email}</p>
            </div>
          )}
          {project.client && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">CLIENT</p>
              <p className="text-sm font-semibold text-gray-800">{project.client.name}</p>
              <p className="text-xs text-gray-500">{project.client.email}</p>
            </div>
          )}
          {project.deadline && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">DEADLINE</p>
              <p className="text-sm font-semibold text-gray-800">{new Date(project.deadline).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">
                {Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left
              </p>
            </div>
          )}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-semibold mb-1">TEAM SIZE</p>
            <p className="text-sm font-semibold text-gray-800">{project.members?.length || 0} Developer{(project.members?.length || 0) > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Project Progress</h2>
        
        <div className="space-y-6">
          {/* Main Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
              <span className="text-2xl font-bold text-purple-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.completed} of {stats.total} tasks completed</p>
          </div>

          {/* Task Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'bg-gray-100', textColor: 'text-gray-800' },
              { label: 'Completed', value: stats.completed, color: 'bg-green-100', textColor: 'text-green-800' },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-100', textColor: 'text-blue-800' },
              { label: 'Pending', value: stats.pending, color: 'bg-yellow-100', textColor: 'text-yellow-800' },
              { label: 'On Hold', value: stats.onHold, color: 'bg-orange-100', textColor: 'text-orange-800' }
            ].map((stat, idx) => (
              <div key={idx} className={`${stat.color} rounded-lg p-3 text-center`}>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Status Distribution Chart */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Distribution</h3>
            <div className="space-y-2">
              {[
                { status: 'completed', label: 'Completed', count: stats.completed },
                { status: 'in_progress', label: 'In Progress', count: stats.inProgress },
                { status: 'pending', label: 'Pending', count: stats.pending },
                { status: 'on_hold', label: 'On Hold', count: stats.onHold }
              ].map((item, idx) => {
                const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-800">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${getStatusColor(item.status)} h-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
              href={`/projects/${projectId}/tasks`}
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
