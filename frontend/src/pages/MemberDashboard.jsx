import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { formatDate, isOverdue } from '../utils/helpers';

/**
 * Member Dashboard
 * Personal task view focused on individual assignments
 */
const MemberDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTask: 0,
  });
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      const tasksRes = await axiosInstance.get('/tasks');
      const allTasks = tasksRes.data;

      // Filter only tasks assigned to this member
      const myAssignedTasks = allTasks.filter(t => t.assigned_to === user?.id);
      
      setMyTasks(myAssignedTasks);

      const completed = myAssignedTasks.filter(t => t.status === 'done').length;
      const pending = myAssignedTasks.filter(t => t.status === 'open').length;
      const overdue = myAssignedTasks.filter(t => 
        t.status === 'open' && t.due_date && isOverdue(t.due_date)
      ).length;

      setStats({
        myTasks: myAssignedTasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        overdueTask: overdue,
      });
    } catch (error) {
      console.error('Failed to fetch member data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <PageHeader
        title={`Welcome ${user?.name}!`}
        subtitle="Your personal task dashboard"
      />

      {/* Member Stats Grid - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">My Tasks</p>
              <p className="text-3xl font-bold text-primary">{stats.myTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-orange-500">{stats.pendingTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdueTask}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* My Tasks List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">My Assigned Tasks</h3>
        
        {myTasks.length > 0 ? (
          <div className="space-y-3">
            {myTasks.map(task => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {task.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'done' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {task.status === 'done' ? 'Done' : 'Pending'}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {task.project && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          {task.project.title}
                        </span>
                      )}
                      
                      {task.due_date && (
                        <span className={`flex items-center gap-1 ${
                          isOverdue(task.due_date) && task.status === 'open' 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-500'
                        }`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due {formatDate(task.due_date)}
                          {isOverdue(task.due_date) && task.status === 'open' && ' (Overdue!)'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {task.status === 'open' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                      Mark Done
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 bg-highlight">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-semibold mb-2 text-gray-700">No Tasks Assigned</h3>
            <p className="text-gray-600">You don't have any tasks assigned yet. Check back later!</p>
          </Card>
        )}
      </div>

      {/* Productivity Tip */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h3 className="text-xl font-semibold mb-2">💡 Productivity Tip</h3>
          <p className="text-blue-50">
            Focus on completing one task at a time. Prioritize tasks by due date and importance to maximize your productivity!
          </p>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;
