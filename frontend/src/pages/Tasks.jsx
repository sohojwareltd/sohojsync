import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';
import { formatDate, isOverdue } from '../utils/helpers';

/**
 * Tasks Page - Minimalistic Design
 */
const Tasks = () => {
  const { user } = useAuth();
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
            <p className="text-sm text-gray-600 mt-0.5">Track and manage your tasks</p>
          </div>
          {user?.role !== 'developer' && (
            <button 
              className="px-3 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5" 
              style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-3 shadow-sm border" style={{borderColor: '#e5e7eb'}}>
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
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

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all' ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={filter === 'all' ? {background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'} : {}}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'open' ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={filter === 'open' ? {background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'} : {}}
            >
              Open ({tasks.filter(t => t.status === 'open').length})
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'done' ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={filter === 'done' ? {background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'} : {}}
            >
              Done ({tasks.filter(t => t.status === 'done').length})
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="bg-white border rounded-lg p-3 hover:shadow-md transition-all"
              style={{borderColor: '#e5e7eb', borderLeftColor: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)', borderLeftWidth: '3px'}}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-gray-800">
                      {task.title}
                    </h3>
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{background: task.status === 'done' ? 'rgb(107, 114, 128)' : '#F25292'}}
                    >
                      {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'Open'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    {task.project && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                        </svg>
                        {task.project.title}
                      </span>
                    )}
                    
                    {task.due_date && (
                      <span className={`flex items-center gap-1 ${
                        isOverdue(task.due_date) && task.status !== 'done' ? 'text-red-600 font-medium' : ''
                      }`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Due {formatDate(task.due_date)}
                        {isOverdue(task.due_date) && task.status !== 'done' && ' (Overdue)'}
                      </span>
                    )}

                    {task.priority && (
                      <span className="px-1.5 py-0.5 rounded text-xs text-white" style={{background: 'rgb(75, 85, 99)'}}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
                
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-8 text-center" style={{borderColor: '#e5e7eb'}}>
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-base font-semibold mb-1 text-gray-700">
            {filter === 'all' ? 'No Tasks Yet' : `No ${filter} tasks`}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {filter === 'all' 
              ? 'Create your first task to get started' 
              : `You don't have any ${filter} tasks`
            }
          </p>
          {filter === 'all' && (
            <button 
              className="px-3 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all" 
              style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}
            >
              + Create Task
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
