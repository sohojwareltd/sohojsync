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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [statusForm, setStatusForm] = useState({ name: '', color: '#8B5CF6', order: 0 });

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

  const openStatusModal = (status = null) => {
    if (status) {
      setEditingStatus(status);
      setStatusForm({ name: status.name, color: status.color, order: status.order });
    } else {
      setEditingStatus(null);
      setStatusForm({ name: '', color: '#8B5CF6', order: workflowStatuses.length });
    }
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setEditingStatus(null);
  };

  const handleSubmitStatus = async (e) => {
    e.preventDefault();

    try {
      if (editingStatus) {
        const response = await axiosInstance.put(`/api/projects/${projectId}/workflow-statuses/${editingStatus.id}`, statusForm);
        console.log('Update response:', response.data);
      } else {
        const response = await axiosInstance.post(`/api/projects/${projectId}/workflow-statuses`, statusForm);
        console.log('Create response:', response.data);
      }

      // Close modal first
      closeStatusModal();
      
      // Force refresh data
      await fetchData();
      
      // Show success message
      alert('Status saved successfully!');
    } catch (error) {
      console.error('Error saving status:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.response?.data?.errors?.color?.[0] || 'Failed to save status. Please try again.';
      alert('Error: ' + errorMessage);
    }
  };

  const handleDeleteStatus = async (statusId) => {
    const tasksInStatus = getTasksForStatus(statusId);
    if (tasksInStatus.length > 0) {
      alert(`Cannot delete status with ${tasksInStatus.length} task(s). Please move or delete tasks first.`);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this status?')) return;

    try {
      const response = await axiosInstance.delete(`/api/projects/${projectId}/workflow-statuses/${statusId}`);
      console.log('Delete response:', response.data);
      
      // Close modal first
      closeStatusModal();
      
      // Force refresh data
      await fetchData();
      
      // Show success message
      alert('Status deleted successfully!');
    } catch (error) {
      console.error('Error deleting status:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete status. Please try again.';
      alert('Error: ' + errorMessage);
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
    <div className="flex flex-col overflow-hidden bg-white" style={{ height: '88vh' }}>
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b p-3" style={{borderColor: '#e5e7eb'}}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/projects')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Projects"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-800">{project.title}</h1>
              <p className="text-sm text-gray-600">Task Board - {tasks.length} tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openStatusModal()}
              className="px-3 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all flex items-center gap-1.5"
              style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
              title="Customize Statuses"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Statuses
            </button>
            <button
              onClick={() => openTaskModal()}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white hover:shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board - Scrollable */}
      <div className="flex-1 overflow-hidden p-3">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 h-full overflow-x-auto custom-scrollbar">
            {workflowStatuses.map(status => (
              <div key={status.id} className="flex-shrink-0 w-80 flex flex-col h-full">
                <div className="bg-white rounded-lg shadow-sm flex flex-col h-full overflow-hidden border" style={{borderColor: '#e5e7eb'}}>
                  {/* Column Header */}
                  <div className="px-3 py-2 flex-shrink-0 border-b" style={{borderColor: '#e5e7eb'}}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }}></div>
                        <h3 className="font-semibold text-gray-800 text-sm">{status.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                          {getTasksForStatus(status.id).length}
                        </span>
                        <button
                          onClick={() => openStatusModal(status)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Edit Status"
                        >
                          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tasks - Scrollable */}
                  <Droppable droppableId={status.id.toString()}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto custom-scrollbar p-2 ${
                          snapshot.isDraggingOver ? 'bg-gray-50' : 'bg-white'
                        } transition-colors`}
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
                                className={`bg-white rounded-lg p-3 mb-2 cursor-pointer transition-all ${
                                  snapshot.isDragging 
                                    ? 'shadow-lg border' 
                                    : 'border hover:shadow-md'
                                }`}
                                style={{...provided.draggableProps.style, borderColor: snapshot.isDragging ? 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' : '#e5e7eb'}}
                                onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                              >
                                {/* Task Header */}
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-500">
                                    #{task.id}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className="text-xs px-2 py-0.5 rounded font-medium text-white"
                                      style={{background: task.priority === 'low' ? 'rgb(107, 114, 128)' : '#F25292'}}
                                    >
                                      {task.priority.toUpperCase()}
                                    </span>
                                  </div>
                                </div>

                                {/* Title */}
                                <h4 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
                                  {task.title}
                                </h4>

                                {/* Labels */}
                                {task.labels && task.labels.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {task.labels.slice(0, 3).map((label, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs text-white px-2 py-0.5 rounded font-medium"
                                        style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}
                                      >
                                        {label}
                                      </span>
                                    ))}
                                    {task.labels.length > 3 && (
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                                        +{task.labels.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Task Footer */}
                                <div className="flex items-center justify-between pt-2 border-t" style={{borderColor: '#e5e7eb'}}>
                                  <div className="flex -space-x-2">
                                    {task.assigned_users && task.assigned_users.slice(0, 3).map(user => (
                                      <div
                                        key={user.id}
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                                        style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
                                        title={user.name}
                                      >
                                        {user.name.charAt(0).toUpperCase()}
                                      </div>
                                    ))}
                                    {task.assigned_users && task.assigned_users.length > 3 && (
                                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold border-2 border-white">
                                        +{task.assigned_users.length - 3}
                                      </div>
                                    )}
                                  </div>
                                  {task.due_date && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="px-4 py-3 border-b" style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)', borderColor: '#e5e7eb' }}>
              <h2 className="text-base font-semibold text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitTask} className="p-4">
              <div className="space-y-3">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1"
                    style={{borderColor: '#e5e7eb'}}
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
                              style={{ backgroundColor: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
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
                      style={{ background: 'rgb(220, 38, 38)' }}
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
                    style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Customization Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 text-white rounded-t-lg" style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}>
              <h2 className="text-lg font-semibold">
                {editingStatus ? 'Edit Status' : 'Add New Status'}
              </h2>
              <p className="text-sm text-purple-100 mt-1">
                {editingStatus ? 'Update workflow status details' : 'Create a new workflow status for tasks'}
              </p>
            </div>

            <form onSubmit={handleSubmitStatus} className="p-6">
              <div className="space-y-4">
                {/* Status Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={statusForm.name}
                    onChange={e => setStatusForm({ ...statusForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., In Progress, Done"
                  />
                </div>

                {/* Status Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Color *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={statusForm.color}
                      onChange={e => setStatusForm({ ...statusForm, color: e.target.value })}
                      className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={statusForm.color}
                      onChange={e => setStatusForm({ ...statusForm, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="#8B5CF6"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This color will appear as an indicator on the status column</p>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={statusForm.order}
                    onChange={e => setStatusForm({ ...statusForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first on the board</p>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusForm.color }}></div>
                      <span className="text-sm font-semibold text-gray-800">
                        {statusForm.name || 'Status Name'}
                      </span>
                      <span className="ml-auto bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                        0
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div>
                  {editingStatus && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStatus(editingStatus.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
                      style={{ background: 'rgb(220, 38, 38)' }}
                    >
                      Delete Status
                    </button>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeStatusModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
                  >
                    {editingStatus ? 'Update Status' : 'Create Status'}
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
