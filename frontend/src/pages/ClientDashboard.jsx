import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { formatDate, isOverdue } from '../utils/helpers';

/**
 * Client Dashboard
 * Shows projects belonging to the client and tasks within those projects
 */
const ClientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myProjects: 0,
    myTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [myTasks, setMyTasks] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        axiosInstance.get('/projects'),
        axiosInstance.get('/tasks'),
      ]);

      const allProjects = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data.data || []);
      const allTasks = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data.data || []);

      // Client: projects where client_id matches the logged-in user
      const clientProjects = allProjects.filter(p => (
        p.client_id === user?.id || p.client?.id === user?.id
      ));
      setMyProjects(clientProjects);

      // Tasks within client's projects only
      const relevantProjectIds = new Set(clientProjects.map(p => p.id));
      const clientTasks = allTasks.filter(t => relevantProjectIds.has(t.project?.id));
      setMyTasks(clientTasks);

      const completed = clientTasks.filter(t => ['done','completed'].includes(String(t.status).toLowerCase())).length;
      const pending = clientTasks.filter(t => ['open','in_progress'].includes(String(t.status).toLowerCase())).length;

      setStats({
        myProjects: clientProjects.length,
        myTasks: clientTasks.length,
        completedTasks: completed,
        pendingTasks: pending,
      });
    } catch (error) {
      console.error('Failed to fetch client data:', error);
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
        subtitle="Track your projects and their progress"
      />

      {/* Client Stats Grid - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">My Projects</p>
              <p className="text-3xl font-bold text-primary">{stats.myProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">All Tasks</p>
              <p className="text-3xl font-bold text-accent">{stats.myTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent bg-opacity-10 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-orange-500">{stats.pendingTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">My Projects</h3>
            <a href="/client/projects" className="text-primary hover:underline text-sm font-medium">View All</a>
          </div>
          {myProjects.length > 0 ? (
            <div className="space-y-3">
              {myProjects.map(project => {
                const projectTasks = myTasks.filter(t => t.project?.id === project.id);
                const completedCount = projectTasks.filter(t => ['done','completed'].includes(String(t.status).toLowerCase())).length;
                const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;
                
                return (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{project.title || project.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">PM: {project.project_manager?.name || 'Unassigned'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status?.replace('_', ' ').toUpperCase() || 'PLANNING'}
                        </span>
                      </div>
                      {projectTasks.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-xs font-semibold text-gray-700">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{completedCount} of {projectTasks.length} tasks done</p>
                        </div>
                      )}
                    </div>
                    <a href={`/client/projects/${project.id}`} className="text-primary font-medium text-sm hover:underline">
                      View Project →
                    </a>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-8 bg-highlight">
              <p className="text-gray-600">No projects assigned to you.</p>
            </Card>
          )}
        </div>

        {/* Project Tasks */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Tasks Overview</h3>
          {myTasks.length > 0 ? (
            <div className="space-y-3">
              {myTasks.slice(0, 5).map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{task.title}</h4>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{task.project?.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          ['done','completed'].includes(String(task.status).toLowerCase())
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {['done','completed'].includes(String(task.status).toLowerCase()) ? '✓ Done' : '⏳ In Progress'}
                        </span>
                        {task.assigned_to && (
                          <span className="text-xs text-gray-500">Assigned to developer</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {myTasks.length > 5 && (
                <a href="/client/tasks" className="text-primary font-medium text-sm hover:underline">
                  View all {myTasks.length} tasks →
                </a>
              )}
            </div>
          ) : (
            <Card className="text-center py-8 bg-highlight">
              <p className="text-gray-600">No tasks yet.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Client Tip */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h3 className="text-xl font-semibold mb-2">📊 Project Insights</h3>
          <p className="text-blue-50">
            Monitor your project progress through task completion. Stay in touch with your project manager for updates and timelines.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
