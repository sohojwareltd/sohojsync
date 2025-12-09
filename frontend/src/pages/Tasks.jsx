import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { formatDate, isOverdue } from '../utils/helpers';
import clsx from 'clsx';

/**
 * Tasks Page
 * Display and filter tasks
 */
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, done

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Track and manage your tasks"
        actions={
          <Button variant="primary">
            + New Task
          </Button>
        }
      />

      {/* Filter buttons */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
          className="text-sm"
        >
          All ({tasks.length})
        </Button>
        <Button
          variant={filter === 'open' ? 'primary' : 'secondary'}
          onClick={() => setFilter('open')}
          className="text-sm"
        >
          Open ({tasks.filter(t => t.status === 'open').length})
        </Button>
        <Button
          variant={filter === 'done' ? 'primary' : 'secondary'}
          onClick={() => setFilter('done')}
          className="text-sm"
        >
          Completed ({tasks.filter(t => t.status === 'done').length})
        </Button>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {task.title}
                    </h3>
                    <span className={clsx(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      task.status === 'done' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    )}>
                      {task.status === 'done' ? 'Done' : 'Open'}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {task.project && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {task.project.title}
                      </span>
                    )}
                    
                    {task.due_date && (
                      <span className={clsx(
                        'flex items-center gap-1',
                        isOverdue(task.due_date) && task.status === 'open' && 'text-red-600 font-medium'
                      )}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Due {formatDate(task.due_date)}
                        {isOverdue(task.due_date) && task.status === 'open' && ' (Overdue)'}
                      </span>
                    )}
                  </div>
                </div>
                
                <Button variant="secondary" className="text-sm py-1">
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 bg-highlight">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-xl font-semibold mb-2 text-gray-700">
            {filter === 'all' ? 'No Tasks Yet' : `No ${filter} tasks`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Create your first task to get started' 
              : `You don't have any ${filter} tasks`
            }
          </p>
          {filter === 'all' && (
            <Button variant="primary">
              + Create Task
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default Tasks;
