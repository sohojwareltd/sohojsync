import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/Loader';
import { formatDate, isOverdue } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import AdminTasksCalendar from './AdminTasksCalendar';

const getRolePrefix = (role) => {
    switch (role) {
        case 'admin':
            return '/admin';
        case 'project_manager':
        case 'project-manager':
            return '/manager';
        case 'developer':
            return '/developer';
        case 'client':
            return '/client';
        default:
            return '';
    }
};

const getInitials = (name = '') => {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || '')
        .join('');
};

/**
 * Admin Tasks Page
 */
const AdminTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
    const pageSize = 12;
    const rolePrefix = getRolePrefix(user?.role || 'admin');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axiosInstance.get('/tasks');
            console.log('Tasks API Response:', response.data);
            
            let tasksData = response.data;
            
            // Handle nested data structure
            if (tasksData.data && Array.isArray(tasksData.data)) {
                tasksData = tasksData.data;
            } else if (!Array.isArray(tasksData)) {
                tasksData = [];
            }
            
            console.log('Parsed Tasks:', tasksData);
            setTasks(tasksData);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            console.error('Error details:', error.response?.data || error.message);
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

    // Show calendar view if selected
    if (viewMode === 'calendar') {
        return <AdminTasksCalendar />;
    }

    const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const visibleTasks = filteredTasks.slice(startIndex, startIndex + pageSize);

    const getResponsible = (task) => {
        const developerPool = [];

        // Priority 1: Check task_assignments table for explicit assignments
        if (Array.isArray(task.task_assignments) && task.task_assignments.length > 0) {
            task.task_assignments.forEach((assignment) => {
                const user = assignment.user || assignment;
                developerPool.push({
                    id: user.id,
                    name: user.name || user.full_name || user.username || 'Developer',
                    role: 'developer',
                    roleLabel: 'Developer',
                    from: '#111827',
                    to: '#1f2937'
                });
            });
        }

        // Direct assignee fallback
        if (developerPool.length === 0 && task.assignee) {
            developerPool.push(task.assignee);
        }

        // Priority 2: Fallback to project members if no task assignments
        if (developerPool.length === 0) {
            const projectMembers = Array.isArray(task.project?.members) ? task.project.members : [];
            const projectDevelopers = Array.isArray(task.project?.developers) ? task.project.developers : [];
            const projectUsers = Array.isArray(task.project?.users) ? task.project.users : [];

            const pooledProjectDevs = [...projectMembers, ...projectDevelopers, ...projectUsers].filter((u) => {
                const role = u.role || u.pivot?.role;
                return role === 'developer';
            });

            if (pooledProjectDevs.length > 0) {
                developerPool.push(...pooledProjectDevs);
            } else {
                developerPool.push(...projectMembers, ...projectUsers);
            }
        }

        const developers = developerPool
            .map((dev) => ({
                id: dev.id || dev.user_id,
                name: dev.name || dev.full_name || dev.username || 'Developer',
                avatar: dev.avatar || dev.profile_image || null,
                role: 'developer',
                roleLabel: 'Developer',
                from: '#111827',
                to: '#1f2937'
            }))
            .filter(person => person.id || person.name)
            .reduce((acc, person) => {
                const exists = acc.some(p => p.id && person.id && p.id === person.id && p.role === person.role);
                return exists ? acc : [...acc, person];
            }, []);

        const pm = task.project?.project_manager || task.project_manager;
        const projectManager = pm ? [{
            id: pm.id,
            name: pm.name || pm.full_name || pm.username || 'Project Manager',
            avatar: pm.avatar || pm.profile_image || null,
            role: 'project-manager',
            roleLabel: 'Project Manager',
            from: '#7c3aed',
            to: '#6366f1'
        }] : [];

        const extraDevelopers = Math.max(0, developers.length - 2);
        const visibleDevelopers = developers.slice(0, 2);
        const avatars = [...visibleDevelopers, ...projectManager];
        const labelText = [...visibleDevelopers, ...projectManager]
            .map(person => person.name)
            .filter(Boolean)
            .join(', ');

        return { avatars, extraDevelopers, labelText };
    };

    const getStatusClasses = (status) => {
        const normalized = (status || '').toLowerCase();
        if (normalized === 'done' || normalized === 'completed') return 'text-green-700 bg-green-50 border-green-200';
        if (normalized === 'in_progress') return 'text-blue-700 bg-blue-50 border-blue-200';
        if (normalized === 'open' || normalized === 'pending') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        return 'text-gray-700 bg-gray-50 border-gray-200';
    };

    return (
        <div className="p-6 space-y-5" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <div className="bg-white rounded-xl p-5 border" style={{ borderColor: '#e9ecef' }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
                        <p className="text-sm text-gray-600 mt-1">Track and manage all tasks</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    viewMode === 'table'
                                        ? 'text-white'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                                style={viewMode === 'table' ? { background: 'rgb(99, 102, 241)' } : {}}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V3m-6 4h12m-12 6h12m-12 6h12" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    viewMode === 'calendar'
                                        ? 'text-white'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                                style={viewMode === 'calendar' ? { background: 'rgb(99, 102, 241)' } : {}}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                        <button
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                            style={{ background: 'rgb(99, 102, 241)' }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Task
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-5 border" style={{ borderColor: '#e9ecef' }}>
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    <div className="flex-1">
                        <div className="relative">
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 hover:border-gray-300 transition-colors text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {['all', 'open', 'in_progress', 'done'].map((status) => {
                            const active = filter === status;
                            const label = status === 'all' ? 'All' : status.replace('_', ' ');
                            const count = status === 'all' ? tasks.length : tasks.filter(t => t.status === status).length;
                            return (
                                <button
                                    key={status}
                                    onClick={() => { setFilter(status); setPage(1); }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                    style={active ? { background: 'rgb(99, 102, 241)' } : {}}
                                >
                                    {label.charAt(0).toUpperCase() + label.slice(1)} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tasks Table */}
            {filteredTasks.length > 0 ? (
                <div className="bg-white rounded-xl border" style={{ borderColor: '#e5e7eb' }}>
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
                                    const dueText = task.due_date ? formatDate(task.due_date) : 'Not set';
                                    const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'done';
                                    const workflowStatus = task.workflow_status?.name || task.workflow_status || 'Not set';
                                    const { avatars, extraDevelopers, labelText } = getResponsible(task);
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
                                            <td className="px-4 py-3 align-top text-gray-700">{workflowStatus}</td>
                                            <td className="px-4 py-3 align-top text-gray-700">
                                                <div className="flex items-center gap-1 text-xs font-medium">
                                                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className={overdue ? 'text-red-600' : 'text-gray-700'}>{dueText}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 align-top text-gray-700">
                                                {avatars.length > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex -space-x-2">
                                                            {avatars.map((person, idx) => (
                                                                <a
                                                                    key={`${person.role}-${person.id || idx}`}
                                                                    href={`${rolePrefix}/users/${person.role}/${person.id}`}
                                                                    title={`${person.name} - ${person.roleLabel}`}
                                                                    className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer overflow-hidden flex-shrink-0"
                                                                    style={person.avatar ? { backgroundImage: `url(${person.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundImage: `linear-gradient(135deg, ${person.from}, ${person.to})` }}
                                                                >
                                                                    {!person.avatar && getInitials(person.name)}
                                                                </a>
                                                            ))}
                                                            {extraDevelopers > 0 && (
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center border-2 border-white flex-shrink-0">+{extraDevelopers}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    'Not assigned'
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <span className="text-sm text-gray-600 font-medium">
                            Showing {filteredTasks.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${currentPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300'}`}
                                title="Previous page"
                            >
                                ← Prev
                            </button>
                            <div className="flex items-center gap-1 px-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === p ? 'bg-blue-600 text-white border border-blue-600' : 'text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${currentPage === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300'}`}
                                title="Next page"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border rounded-xl p-8 text-center" style={{ borderColor: '#e5e7eb' }}>
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-base font-semibold mb-1 text-gray-700">
                        {filter === 'all' ? 'No Tasks Yet' : `No ${filter.replace('_', ' ')} tasks`}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {filter === 'all'
                            ? 'Create your first task to get started'
                            : `You don't have any ${filter.replace('_', ' ')} tasks`
                        }
                    </p>
                    <button
                        className="px-3 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
                        style={{ background: 'rgb(99, 102, 241)' }}
                    >
                        + Create Task
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminTasks;
