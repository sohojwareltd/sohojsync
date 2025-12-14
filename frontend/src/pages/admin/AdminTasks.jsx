import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/Loader';
import { formatDate, isOverdue } from '../../utils/helpers';

/**
 * Admin Tasks Page
 */
const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get('/tasks');
      const tasksData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-3 shadow-sm border" style={{borderColor: '#e5e7eb'}}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-gray-800">Tasks</h1>
            <p className="text-sm text-gray-600 mt-0.5">Track and manage all tasks</p>
          </div>
          <button 
            className="px-3 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5" 
            style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-3 shadow-sm border" style={{borderColor: '#e5e7eb'}}>
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1"
                style={{borderColor: '#e5e7eb'}}
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {['all', 'open', 'in_progress', 'done'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={filter === status ? {background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'} : {}}
              >
                {status === 'all' ? `All (${tasks.length})` : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm border text-center" style={{borderColor: '#e5e7eb'}}>
            <p className="text-gray-500 text-sm">No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-all" style={{borderColor: '#e5e7eb'}}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800 truncate">{task.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">{task.description || 'No description'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      task.status === 'done' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                    {task.due_date && (
                      <span className={`text-xs ${isOverdue(task.due_date) && task.status !== 'done' ? 'text-red-600' : 'text-gray-500'}`}>
                        Due: {formatDate(task.due_date)}
                      </span>
                    )}
                    {task.project && (
                      <span className="text-xs text-gray-500">Project: {task.project.name || task.project.title}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTasks;
