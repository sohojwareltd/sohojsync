import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';

/**
 * Manager Dashboard
 * Team overview with projects and task assignments
 */
const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myProjects: 0,
    totalTasks: 0,
    assignedToMe: 0,
    teamTasks: 0,
  });
  const [myProjects, setMyProjects] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        axiosInstance.get('/api/projects'),
        axiosInstance.get('/api/tasks'),
      ]);

      const projects = projectsRes.data;
      const tasks = tasksRes.data;

      setMyProjects(projects);
      setTeamTasks(tasks);

      const assignedToMeTasks = tasks.filter(t => t.assigned_to === user?.id);

      setStats({
        myProjects: projects.length,
        totalTasks: tasks.length,
        assignedToMe: assignedToMeTasks.length,
        teamTasks: tasks.filter(t => t.status === 'open').length,
      });
    } catch (error) {
      console.error('Failed to fetch manager data:', error);
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
        title={`Manager Dashboard - Welcome ${user?.name}!`}
        subtitle="Manage your team's projects and tasks"
      />

      {/* Manager Stats Grid - 4 cards */}
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
              <p className="text-3xl font-bold text-accent">{stats.totalTasks}</p>
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
              <p className="text-sm text-gray-600 mb-1">Assigned to Me</p>
              <p className="text-3xl font-bold text-blue-600">{stats.assignedToMe}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Team Open Tasks</p>
              <p className="text-3xl font-bold text-orange-500">{stats.teamTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects */}
        <div>
          <h3 className="text-xl font-semibold mb-4">My Projects</h3>
          <div className="space-y-3">
            {myProjects.length > 0 ? (
              myProjects.map(project => (
                <Card key={project.id}>
                  <h4 className="font-semibold text-lg mb-2">{project.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    <button className="text-primary hover:underline">Manage</button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8 bg-highlight">
                <p className="text-gray-600">No projects yet. Start creating!</p>
              </Card>
            )}
          </div>
        </div>

        {/* Team Tasks */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Team Tasks</h3>
          <div className="space-y-3">
            {teamTasks.length > 0 ? (
              teamTasks.slice(0, 5).map(task => (
                <Card key={task.id}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'done' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {task.status === 'done' ? 'Done' : 'Open'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{task.project?.title}</p>
                  {task.assigned_to === user?.id && (
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      ✓ Assigned to you
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="text-center py-8 bg-highlight">
                <p className="text-gray-600">No tasks available</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Manager Actions */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-accent to-blue-500 text-white">
          <h3 className="text-xl font-semibold mb-2">Manager Tools</h3>
          <p className="mb-4">Coordinate your team's work effectively</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white text-accent rounded-lg font-medium hover:bg-opacity-90">
              Create Project
            </button>
            <button className="px-4 py-2 bg-white text-accent rounded-lg font-medium hover:bg-opacity-90">
              Assign Tasks
            </button>
            <button className="px-4 py-2 bg-white text-accent rounded-lg font-medium hover:bg-opacity-90">
              Team Reports
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
