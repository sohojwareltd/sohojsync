import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/Loader';
import { formatDate, isOverdue } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';

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

const AdminTasksCalendar = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // week, day, month
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        time: '09:00',
        category: 'Website Translation',
        duration: '1'
    });
    const rolePrefix = getRolePrefix(user?.role || 'admin');

    useEffect(() => {
        fetchTasks();
        console.log('AdminTasksCalendar mounted');
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axiosInstance.get('/tasks');
            let tasksData = response.data;
            if (tasksData.data && Array.isArray(tasksData.data)) {
                tasksData = tasksData.data;
            } else if (!Array.isArray(tasksData)) {
                tasksData = [];
            }
            console.log('Calendar tasks loaded:', tasksData);
            setTasks(tasksData);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Website Translation': { bg: 'bg-purple-500', text: 'text-white' },
            'Website Development': { bg: 'bg-blue-500', text: 'text-white' },
            'Blog Post Writing': { bg: 'bg-green-500', text: 'text-white' },
            'Employee Training': { bg: 'bg-yellow-500', text: 'text-white' },
            'Marketing': { bg: 'bg-pink-500', text: 'text-white' },
            'Executive meeting': { bg: 'bg-indigo-500', text: 'text-white' },
        };
        return colors[category] || { bg: 'bg-gray-500', text: 'text-white' };
    };

    const getWeekDays = () => {
        const week = [];
        const curr = new Date(currentDate);
        const first = curr.getDate() - curr.getDay();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(curr.setDate(first + i));
            week.push(new Date(date));
        }
        return week;
    };

    const getTasksForWeek = () => {
        const week = getWeekDays();
        const weekTasks = [];
        
        tasks.forEach((task, taskIdx) => {
            if (task.due_date) {
                const taskDate = new Date(task.due_date);
                week.forEach((day, dayIdx) => {
                    if (taskDate.getDate() === day.getDate() &&
                        taskDate.getMonth() === day.getMonth() &&
                        taskDate.getFullYear() === day.getFullYear()) {
                        // Add default time and category if missing
                        const hour = String(9 + (taskIdx % 8)).padStart(2, '0');
                        const categories = ['Website Translation', 'Website Development', 'Blog Post Writing', 'Employee Training', 'Marketing', 'Executive meeting'];
                        const taskWithDefaults = {
                            ...task,
                            time: task.time || `${hour}:00`,
                            category: task.category || categories[taskIdx % categories.length],
                            dayIndex: dayIdx,
                            displayDate: day
                        };
                        weekTasks.push(taskWithDefaults);
                    }
                });
            }
        });
        
        console.log('Week Tasks:', weekTasks);
        return weekTasks;
    };

    const handleCreateEvent = async () => {
        if (!formData.title || !formData.time) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                due_date: selectedDate?.toISOString().split('T')[0],
                status: 'open',
                priority: 'medium',
            };

            await axiosInstance.post('/tasks', payload);
            setFormData({ title: '', description: '', time: '09:00', category: 'Website Translation', duration: '1' });
            setShowModal(false);
            setSelectedDate(null);
            fetchTasks();
        } catch (error) {
            console.error('Failed to create task:', error);
            alert('Error creating task');
        }
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const weekDays = getWeekDays();
    const weekTasks = getTasksForWeek();

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-6 space-y-5" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <div className="bg-white rounded-xl p-5 border" style={{ borderColor: '#e9ecef' }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage your tasks, events, and meetings</p>
                    </div>
                    <button
                        onClick={() => { setSelectedDate(new Date()); setShowModal(true); }}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                        style={{ background: 'rgb(89, 86, 157)' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Event
                    </button>
                </div>
            </div>

            {/* View Controls */}
            <div className="bg-white rounded-xl p-4 border flex items-center justify-between" style={{ borderColor: '#e9ecef' }}>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        today
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('month')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === 'month'
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        style={viewMode === 'month' ? { background: 'rgb(89, 86, 157)' } : {}}
                    >
                        month
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === 'week'
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        style={viewMode === 'week' ? { background: 'rgb(89, 86, 157)' } : {}}
                    >
                        week
                    </button>
                    <button
                        onClick={() => setViewMode('day')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === 'day'
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        style={viewMode === 'day' ? { background: 'rgb(89, 86, 157)' } : {}}
                    >
                        day
                    </button>
                </div>
            </div>

            {/* Week View */}
            {viewMode === 'week' && (
                <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#e9ecef' }}>
                    {/* Day Headers */}
                    <div className="grid grid-cols-8 gap-0 border-b" style={{ borderColor: '#e9ecef' }}>
                        <div className="p-3 font-semibold text-gray-700 text-sm"></div>
                        {weekDays.map((day, idx) => (
                            <div key={idx} className="p-3 text-center border-l" style={{ borderColor: '#e9ecef' }}>
                                <div className="text-xs font-medium text-gray-600">{dayNames[day.getDay()]}</div>
                                <div className="text-sm font-semibold text-gray-900">{day.getDate()}</div>
                            </div>
                        ))}
                    </div>

                    {/* Time Grid */}
                    <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
                        <div className="grid grid-cols-8 gap-0">
                            {/* Time Column */}
                            <div className="border-r" style={{ borderColor: '#e9ecef' }}>
                                {hours.map(hour => (
                                    <div
                                        key={hour}
                                        className="h-20 p-2 text-xs text-gray-500 font-medium border-b text-right pr-3"
                                        style={{ borderColor: '#e9ecef' }}
                                    >
                                        {String(hour).padStart(2, '0')}:00
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            {weekDays.map((day, dayIdx) => (
                                <div
                                    key={dayIdx}
                                    className="border-l relative"
                                    style={{ borderColor: '#e9ecef' }}
                                    onClick={() => { setSelectedDate(new Date(day)); setShowModal(true); }}
                                >
                                    {hours.map(hour => (
                                        <div
                                            key={`${dayIdx}-${hour}`}
                                            className="h-20 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                                            style={{ borderColor: '#e9ecef' }}
                                        ></div>
                                    ))}

                                    {/* Events for this day */}
                                    {weekTasks
                                        .filter(t => t.dayIndex === dayIdx)
                                        .map((task, idx) => {
                                            const colors = getCategoryColor(task.category || 'Website Translation');
                                            const hour = parseInt(task.time?.split(':')[0] || '09');
                                            const minute = parseInt(task.time?.split(':')[1] || '00');
                                            const topPercent = ((hour + minute / 60) / 24) * 100;

                                            return (
                                                <a
                                                    key={`${task.id}-${idx}`}
                                                    href={`${rolePrefix}/tasks/${task.id}`}
                                                    className={`absolute left-0 right-0 mx-1 px-2 py-1 rounded text-xs font-medium text-white truncate hover:opacity-80 transition-opacity ${colors.bg}`}
                                                    style={{
                                                        top: `calc(${topPercent}% + 2px)`,
                                                        height: '40px',
                                                        zIndex: idx + 1
                                                    }}
                                                    title={`${task.time || '09:00'} ${task.title}`}
                                                >
                                                    <div className="text-xs font-bold">{task.time || '09:00'}</div>
                                                    <div className="truncate">{task.title}</div>
                                                </a>
                                            );
                                        })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md border" style={{ borderColor: '#e9ecef' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedDate ? `Add event for ${selectedDate.toDateString()}` : 'Add Event'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                    placeholder="e.g., Write email announcement"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                                <input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                >
                                    <option>Website Translation</option>
                                    <option>Website Development</option>
                                    <option>Blog Post Writing</option>
                                    <option>Employee Training</option>
                                    <option>Marketing</option>
                                    <option>Executive meeting</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
                                    rows="3"
                                    placeholder="Add details..."
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateEvent}
                                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
                                    style={{ background: 'rgb(89, 86, 157)' }}
                                >
                                    Create Event
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTasksCalendar;
