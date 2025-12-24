import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/app/app-sidebar-layout';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface User {
    id: number;
    name: string;
    email: string;
}

interface WorkflowStatus {
    id: number;
    name: string;
    slug: string;
    color: string;
    order: number;
    is_default: boolean;
    is_completed: boolean;
}

interface Task {
    id: number;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    start_date: string | null;
    due_date: string | null;
    estimated_hours: number | null;
    actual_hours: number | null;
    labels: string[] | null;
    order: number;
    workflow_status_id: number;
    workflow_status: WorkflowStatus;
    assigned_users: User[];
}

interface Project {
    id: number;
    title: string;
    description: string;
}

interface TaskBoardProps {
    project: Project;
    auth: { user: User };
}

export default function TaskBoard({ project, auth }: TaskBoardProps) {
    const [workflowStatuses, setWorkflowStatuses] = useState<WorkflowStatus[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    // Task form state
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        start_date: '',
        due_date: '',
        estimated_hours: '',
        labels: [] as string[],
        assigned_users: [] as number[],
    });

    useEffect(() => {
        fetchData();
    }, [project.id]);

    const fetchData = async () => {
        try {
            const [statusesRes, tasksRes, usersRes] = await Promise.all([
                axios.get(`/api/projects/${project.id}/workflow-statuses`),
                axios.get(`/api/projects/${project.id}/tasks`),
                axios.get(`/api/projects/users-for-assignment`),
            ]);

            setWorkflowStatuses(statusesRes.data);
            setTasks(tasksRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result: any) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const taskId = parseInt(draggableId);
        const newStatusId = parseInt(destination.droppableId);

        // Update local state
        const updatedTasks = Array.from(tasks);
        const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
        const task = updatedTasks[taskIndex];

        task.workflow_status_id = newStatusId;
        task.order = destination.index;

        setTasks(updatedTasks);

        // Update on server
        try {
            await axios.patch(`/api/projects/${project.id}/tasks/${taskId}/status`, {
                workflow_status_id: newStatusId,
                order: destination.index,
            });
        } catch (error) {
            console.error('Error updating task status:', error);
            fetchData(); // Revert changes
        }
    };

    const openTaskModal = (task?: Task) => {
        if (task) {
            setEditingTask(task);
            setTaskForm({
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                start_date: task.start_date || '',
                due_date: task.due_date || '',
                estimated_hours: task.estimated_hours?.toString() || '',
                labels: task.labels || [],
                assigned_users: task.assigned_users.map(u => u.id),
            });
        } else {
            setEditingTask(null);
            setTaskForm({
                title: '',
                description: '',
                priority: 'medium',
                start_date: '',
                due_date: '',
                estimated_hours: '',
                labels: [],
                assigned_users: [],
            });
        }
        setShowTaskModal(true);
    };

    const closeTaskModal = () => {
        setShowTaskModal(false);
        setEditingTask(null);
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingTask) {
                await axios.put(`/api/projects/${project.id}/tasks/${editingTask.id}`, taskForm);
            } else {
                await axios.post(`/api/projects/${project.id}/tasks`, taskForm);
            }

            closeTaskModal();
            fetchData();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await axios.delete(`/api/projects/${project.id}/tasks/${taskId}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTasksForStatus = (statusId: number) => {
        return tasks
            .filter(task => task.workflow_status_id === statusId)
            .sort((a, b) => a.order - b.order);
    };

    if (loading) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title={`${project.title} - Tasks`} />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${project.title} - Tasks`} />

            <div className="py-8 px-4">
                <div className="max-w-full mx-auto">
                    {/* Header */}
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                            <p className="text-gray-600 mt-1">Task Board</p>
                        </div>
                        <button
                            onClick={() => openTaskModal()}
                            className="px-6 py-2 rounded-lg font-medium text-white"
                            style={{ backgroundColor: 'rgb(61, 45, 80)' }}
                        >
                            + New Task
                        </button>
                    </div>

                    {/* Kanban Board */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {workflowStatuses.map(status => (
                                <div key={status.id} className="flex-shrink-0 w-80">
                                    <div className="bg-white rounded-lg shadow-sm">
                                        {/* Column Header */}
                                        <div
                                            className="px-4 py-3 rounded-t-lg"
                                            style={{ backgroundColor: status.color }}
                                        >
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-white">{status.name}</h3>
                                                <span className="bg-white bg-opacity-30 text-white px-2 py-1 rounded text-sm">
                                                    {getTasksForStatus(status.id).length}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tasks */}
                                        <Droppable droppableId={status.id.toString()}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`p-3 min-h-[200px] ${
                                                        snapshot.isDraggingOver ? 'bg-gray-50' : ''
                                                    }`}
                                                >
                                                    {getTasksForStatus(status.id).map((task, index) => (
                                                        <Draggable
                                                            key={task.id}
                                                            draggableId={task.id.toString()}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`bg-white border border-gray-200 rounded-lg p-3 mb-3 cursor-pointer hover:shadow-md transition-shadow ${
                                                                        snapshot.isDragging ? 'shadow-lg' : ''
                                                                    }`}
                                                                    onClick={() => openTaskModal(task)}
                                                                >
                                                                    {/* Task Card */}
                                                                    <div className="mb-2">
                                                                        <span className="text-xs text-gray-500">
                                                                            #{task.id}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="font-medium text-gray-900 mb-2">
                                                                        {task.title}
                                                                    </h4>

                                                                    {/* Priority Badge */}
                                                                    <div className="mb-2">
                                                                        <span
                                                                            className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                                                                                task.priority
                                                                            )}`}
                                                                        >
                                                                            {task.priority}
                                                                        </span>
                                                                    </div>

                                                                    {/* Labels */}
                                                                    {task.labels && task.labels.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                                            {task.labels.map((label, idx) => (
                                                                                <span
                                                                                    key={idx}
                                                                                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                                                                                >
                                                                                    {label}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Assignees and Due Date */}
                                                                    <div className="flex justify-between items-center mt-3">
                                                                        <div className="flex -space-x-2">
                                                                            {task.assigned_users.slice(0, 3).map(user => (
                                                                                <div
                                                                                    key={user.id}
                                                                                    className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                                                                    title={user.name}
                                                                                >
                                                                                    {user.name.charAt(0).toUpperCase()}
                                                                                </div>
                                                                            ))}
                                                                            {task.assigned_users.length > 3 && (
                                                                                <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                                                                                    +{task.assigned_users.length - 3}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {task.due_date && (
                                                                            <span className="text-xs text-gray-500">
                                                                                {new Date(task.due_date).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            </div>

            {/* Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b" style={{ backgroundColor: 'rgb(61, 45, 80)' }}>
                            <h2 className="text-2xl font-bold text-white">
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </h2>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmitTask} className="p-6">
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={taskForm.title}
                                        onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={taskForm.description}
                                        onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Priority and Estimated Hours */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority *
                                        </label>
                                        <select
                                            value={taskForm.priority}
                                            onChange={e =>
                                                setTaskForm({
                                                    ...taskForm,
                                                    priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent',
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estimated Hours
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={taskForm.estimated_hours}
                                            onChange={e =>
                                                setTaskForm({ ...taskForm, estimated_hours: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Start Date and Due Date */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={taskForm.start_date}
                                            onChange={e =>
                                                setTaskForm({ ...taskForm, start_date: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={taskForm.due_date}
                                            onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Assigned Users */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assign To
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                                        {users.map(user => (
                                            <label key={user.id} className="flex items-center space-x-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={taskForm.assigned_users.includes(user.id)}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setTaskForm({
                                                                ...taskForm,
                                                                assigned_users: [...taskForm.assigned_users, user.id],
                                                            });
                                                        } else {
                                                            setTaskForm({
                                                                ...taskForm,
                                                                assigned_users: taskForm.assigned_users.filter(
                                                                    id => id !== user.id
                                                                ),
                                                            });
                                                        }
                                                    }}
                                                    className="rounded text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className="text-sm text-gray-700">{user.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                <div>
                                    {editingTask && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTask(editingTask.id)}
                                            className="px-4 py-2 rounded-lg font-medium text-white"
                                            style={{ backgroundColor: 'rgb(155, 2, 50, 0.76)' }}
                                        >
                                            Delete Task
                                        </button>
                                    )}
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={closeTaskModal}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-lg font-medium text-white"
                                        style={{ backgroundColor: 'rgb(61, 45, 80)' }}
                                    >
                                        {editingTask ? 'Update Task' : 'Create Task'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
