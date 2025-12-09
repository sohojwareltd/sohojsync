import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

/**
 * Task Board Page
 * Kanban-style task management with workflow statuses
 */
const TaskBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [workflowStatuses, setWorkflowStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    start_date: '',
    due_date: '',
    estimated_hours: '',
    labels: [],
    assigned_users: [],
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, statusesRes, tasksRes, usersRes] = await Promise.all([
        axiosInstance.get(`/api/projects/${projectId}`),
        axiosInstance.get(`/api/projects/${projectId}/workflow-statuses`),
        axiosInstance.get(`/api/projects/${projectId}/tasks`),
        axiosInstance.get('/api/projects/users-for-assignment'),
      ]);

      setProject(projectRes.data);
      setWorkflowStatuses(statusesRes.data);
      setTasks(tasksRes.data);
      
      // Combine all users for assignment
      const allUsers = [
        ...(usersRes.data.project_managers || []),
        ...(usersRes.data.developers || []),
      ];
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
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

    // Update local state optimistically
    const updatedTasks = Array.from(tasks);
    const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
    const task = updatedTasks[taskIndex];

    task.workflow_status_id = newStatusId;
    task.order = destination.index;

    setTasks(updatedTasks);

    // Update on server
    try {
      await axiosInstance.patch(`/api/projects/${projectId}/tasks/${taskId}/status`, {
        workflow_status_id: newStatusId,
        order: destination.index,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      fetchData(); // Revert changes
    }
  };

  const openTaskModal = (task = null) => {
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
        assigned_users: task.assigned_users?.map(u => u.id) || [],
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

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    try {
      if (editingTask) {
        await axiosInstance.put(`/api/projects/${projectId}/tasks/${editingTask.id}`, taskForm);
      } else {
        await axiosInstance.post(`/api/projects/${projectId}/tasks`, taskForm);
      }

      closeTaskModal();
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axiosInstance.delete(`/api/projects/${projectId}/tasks/${taskId}`);
      closeTaskModal();
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTasksForStatus = (statusId) => {
    return tasks
      .filter(task => task.workflow_status_id === statusId)
      .sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return <Loader />;
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Project not found</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100" style={{ height: '88vh' }}>
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="p-2 hover:bg-purple-50 rounded-lg transition-all duration-200 group"
              title="Back to Projects"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Task Board - {tasks.length} tasks</p>
            </div>
          </div>
          <button
            onClick={() => openTaskModal()}
            className="px-5 py-2.5 rounded-lg font-medium text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            style={{ backgroundColor: 'rgb(61, 45, 80)' }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </span>
          </button>
        </div>
      </div>

      {/* Kanban Board - Scrollable */}
      <div className="flex-1 overflow-hidden px-6 py-3">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full overflow-x-auto custom-scrollbar">
            {workflowStatuses.map(status => (
              <div key={status.id} className="flex-shrink-0 w-80 flex flex-col h-full">
                <div className="bg-white rounded-lg shadow-md flex flex-col h-full overflow-hidden border border-gray-300">
                  {/* Column Header */}
                  <div
                    className="px-4 py-3 flex-shrink-0"
                    style={{ backgroundColor: status.color }}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-white text-sm uppercase tracking-wide">{status.name}</h3>
                      <span className="bg-white bg-opacity-30 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                        {getTasksForStatus(status.id).length}
                      </span>
                    </div>
                  </div>

                  {/* Tasks - Scrollable */}
                  <Droppable droppableId={status.id.toString()}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto custom-scrollbar p-3 ${
                          snapshot.isDraggingOver ? 'bg-purple-50' : 'bg-gray-50'
                        } transition-colors duration-200`}
                        style={{ minHeight: '100px' }}
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
                                className={`bg-white rounded-lg p-3.5 mb-2.5 cursor-pointer transition-all duration-200 ${
                                  snapshot.isDragging 
                                    ? 'shadow-2xl border-2 border-purple-500 rotate-2 scale-105' 
                                    : 'border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300'
                                }`}
                                onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                              >
                                {/* Task Header */}
                                <div className="flex items-start justify-between mb-3">
                                  <span className="text-xs font-semibold text-gray-400 tracking-wider">
                                    #{task.id}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getPriorityColor(
                                        task.priority
                                      )}`}
                                    >
                                      {task.priority.toUpperCase()}
                                    </span>
                                  </div>
                                </div>

                                {/* Task Title */}
                                <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
                                  {task.title}
                                </h4>

                                {/* Labels */}
                                {task.labels && task.labels.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mb-3">
                                    {task.labels.slice(0, 3).map((label, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium"
                                      >
                                        {label}
                                      </span>
                                    ))}
                                    {task.labels.length > 3 && (
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                                        +{task.labels.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Task Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                  <div className="flex -space-x-2">
                                    {task.assigned_users && task.assigned_users.slice(0, 3).map(user => (
                                      <div
                                        key={user.id}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm"
                                        style={{ backgroundColor: 'rgb(61, 45, 80)' }}
                                        title={user.name}
                                      >
                                        {user.name.charAt(0).toUpperCase()}
                                      </div>
                                    ))}
                                    {task.assigned_users && task.assigned_users.length > 3 && (
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-bold border-2 border-white shadow-sm">
                                        +{task.assigned_users.length - 3}
                                      </div>
                                    )}
                                  </div>
                                  {task.due_date && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span className="font-medium">
                                        {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
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
                  <ReactQuill
                    theme="snow"
                    value={taskForm.description}
                    onChange={(value) => setTaskForm({ ...taskForm, description: value })}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'code-block'],
                        ['clean']
                      ],
                    }}
                    className="bg-white rounded-lg"
                    style={{ height: '150px', marginBottom: '50px' }}
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
                      onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
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
                      onChange={e => setTaskForm({ ...taskForm, estimated_hours: e.target.value })}
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
                      onChange={e => setTaskForm({ ...taskForm, start_date: e.target.value })}
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
                    Assign To <span className="text-gray-500 font-normal text-xs">(Optional - auto-assigns project developers if empty)</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg p-2 max-h-40 overflow-y-auto bg-white">
                    {users.length === 0 ? (
                      <p className="text-sm text-gray-500 p-2">No users available</p>
                    ) : (
                      <div className="space-y-1">
                        {users.map(user => (
                          <label 
                            key={user.id} 
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                              taskForm.assigned_users.includes(user.id) 
                                ? 'bg-purple-50 border border-purple-200' 
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                          >
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
                              className="rounded text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                            />
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                              style={{ backgroundColor: 'rgb(61, 45, 80)' }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{user.name}</span>
                              {user.role && (
                                <span className="ml-2 text-xs text-gray-500">({user.role})</span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {taskForm.assigned_users.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 All project developers will be automatically assigned
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div>
                  {editingTask && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(editingTask.id)}
                      className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
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
                    className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
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
    </div>
  );
};

export default TaskBoard;
