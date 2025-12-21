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

  const visibleTasks = filteredTasks.slice(0, 12);

  const getStatusClasses = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'done' || normalized === 'completed') return 'text-green-700 bg-green-50 border-green-200';
    if (normalized === 'in_progress') return 'text-blue-700 bg-blue-50 border-blue-200';
    if (normalized === 'open' || normalized === 'pending') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  return (
    <div className="p-6 space-y-5" style={{background: '#f8f9fa', minHeight: '100vh'}}>
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border" style={{borderColor: '#e9ecef'}}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
            <p className="text-sm text-gray-600 mt-1">Track and manage your tasks</p>
          </div>
          {user?.role !== 'developer' && (
            <button 
              className="px-4 py-2 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm" 
              style={{background: 'rgb(89, 86, 157)'}}
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
      <div className="bg-white rounded-xl p-5 border" style={{borderColor: '#e9ecef'}}>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 hover:border-gray-300 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {['all','open','done'].map((key) => {
              const active = filter === key;
              const label = key === 'all' ? 'All' : key === 'open' ? 'Open' : 'Done';
              const count = key === 'all' ? tasks.length : tasks.filter(t => t.status === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  style={active ? {background: 'rgb(89, 86, 157)'} : {}}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {filteredTasks.length > 0 ? (
        <div className="bg-white rounded-xl border" style={{borderColor: '#e5e7eb'}}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">Task</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Due date</th>
                  <th className="text-left px-4 py-3">Responsible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleTasks.map((task) => {
                  const dueText = task.due_date ? formatDate(task.due_date) : '—';
                  const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'done';
                  const responsible = task.assignee?.name || task.user?.name || '—';
                  const type = task.type || task.category || 'Operational';
                  return (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-gray-900 font-medium">
                            <span className="inline-block w-2 h-2 rounded-full bg-gray-300" aria-hidden="true"></span>
                            <span className="line-clamp-2">{task.title}</span>
                          </div>
                          {task.description && (
                            <div
                              className="text-xs text-gray-600 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: task.description }}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusClasses(task.status)}`}>
                          {task.status ? task.status.replace('_', ' ') : 'New task'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">{type}</td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        <div className="flex items-center gap-1 text-xs font-medium">
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className={overdue ? 'text-red-600' : 'text-gray-700'}>{dueText}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">{responsible}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredTasks.length > 12 && (
            <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-600">
              Showing 12 of {filteredTasks.length} tasks
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-8 text-center" style={{borderColor: '#e5e7eb'}}>
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
              style={{background: 'rgb(89, 86, 157)'}}
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
