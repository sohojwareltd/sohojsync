import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { formatDate, isOverdue } from '../utils/helpers';

/**
 * Developer Dashboard
 * Shows projects the developer is assigned to and tasks assigned to them
 */
const DeveloperDashboard = () => {
    const { user } = useAuth();

    // Helper function to decode HTML entities
    const decodeHtmlEntities = (text) => {
        if (!text) return text;
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };
    const [stats, setStats] = useState({
        myTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTask: 0,
        myProjects: 0,
    });
    const [myTasks, setMyTasks] = useState([]);
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeveloperData();
    }, []);

    const fetchDeveloperData = async () => {
        try {
            const [projectsRes, tasksRes] = await Promise.all([
                axiosInstance.get('/projects'),
                axiosInstance.get('/tasks'),
            ]);

            const allProjects = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data.data || []);
            const developerTasks = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data.data || []);

            // Developer: projects where the user is a member
            const developerProjects = allProjects.filter(p => {
                const members = Array.isArray(p.members) ? p.members : [];
                return members.some(m => m.user_id === user?.id || m.id === user?.id);
            });
            setMyProjects(developerProjects);
            setMyTasks(developerTasks);

            const completed = developerTasks.filter(t => ['done', 'completed'].includes(String(t.status).toLowerCase())).length;
            const pending = developerTasks.filter(t => ['open', 'in_progress'].includes(String(t.status).toLowerCase())).length;
            const overdue = developerTasks.filter(t =>
                ['open', 'in_progress'].includes(String(t.status).toLowerCase()) && t.due_date && isOverdue(t.due_date)
            ).length;

            setStats({
                myTasks: developerTasks.length,
                completedTasks: completed,
                pendingTasks: pending,
                overdueTask: overdue,
                myProjects: developerProjects.length,
            });
        } catch (error) {
            console.error('Failed to fetch developer data:', error);
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
                subtitle="Your developer dashboard - track your projects and tasks"
            />

            {/* Developer Stats Grid - 5 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8" style={{fontFamily: 'Inter, sans-serif'}}>
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
                            <p className="text-sm text-gray-600 mb-1">My Tasks</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Projects */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">My Projects</h3>
                        <a href="/developer/projects" className="text-primary hover:underline text-sm font-medium">View All</a>
                    </div>
                    {myProjects.length > 0 ? (
                        <div className="space-y-3">
                            {myProjects.map(project => (
                                <Card key={project.id} className="hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg text-gray-900">{project.title || project.name}</h4>
                                            <p
                                                className="text-sm text-gray-600 mt-1"
                                                dangerouslySetInnerHTML={{
                                                    __html: project.description
                                                        ? decodeHtmlEntities(project.description).substring(0, 100)
                                                        : 'No description'
                                                }}
                                            />

                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                <span className="px-2 py-1 bg-gray-100 rounded">{project.status?.replace('_', ' ') || 'Planning'}</span>
                                                {project.project_manager && (
                                                    <span>PM: {project.project_manager.name}</span>
                                                )}
                                            </div>
                                        </div>
                                        <a href={`/developer/projects/${project.id}`} className="text-primary font-medium hover:underline whitespace-nowrap ml-4">View</a>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-8 bg-highlight">
                            <p className="text-gray-600">No projects assigned to you yet.</p>
                        </Card>
                    )}
                </div>

                {/* My Tasks */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">My Assigned Tasks</h3>
                    {myTasks.length > 0 ? (
                        <div className="space-y-3">
                            {myTasks.slice(0, 5).map(task => (
                                <Card key={task.id} className="hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${['done', 'completed'].includes(String(task.status).toLowerCase())
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {['done', 'completed'].includes(String(task.status).toLowerCase()) ? 'Done' : 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{task.project?.title || 'No project'}</p>
                                            {task.description && (
                                                <div className="text-sm text-gray-700 mb-2 prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(task.description) }}
                                                />
                                            )}
                                            {task.due_date && (
                                                <p className={`text-xs ${isOverdue(task.due_date) && !['done', 'completed'].includes(String(task.status).toLowerCase()) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                    Due {formatDate(task.due_date)}
                                                    {isOverdue(task.due_date) && !['done', 'completed'].includes(String(task.status).toLowerCase()) && ' (Overdue!)'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {myTasks.length > 5 && (
                                <a href="/developer/tasks" className="text-primary font-medium hover:underline">
                                    View all {myTasks.length} tasks →
                                </a>
                            )}
                        </div>
                    ) : (
                        <Card className="text-center py-8 bg-highlight">
                            <p className="text-gray-600">No tasks assigned yet.</p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Developer Tip */}
            <div className="mt-8">
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <h3 className="text-xl font-semibold mb-2">💡 Development Tip</h3>
                    <p className="text-blue-50">
                        Stay organized by checking your tasks regularly. Coordinate with your team to ensure smooth project delivery!
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default DeveloperDashboard;
