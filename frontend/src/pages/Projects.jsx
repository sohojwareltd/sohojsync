import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * Projects Page
 * Modern design with CRUD operations
 */
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    project_manager_id: '',
    client_id: '',
    developer_ids: [],
    deadline: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [usersForAssignment, setUsersForAssignment] = useState({
    project_managers: [],
    developers: [],
    clients: []
  });

  useEffect(() => {
    fetchProjects();
    fetchUsersForAssignment();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/api/projects');
      setProjects(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersForAssignment = async () => {
    try {
      const response = await axiosInstance.get('/api/projects/users-for-assignment');
      setUsersForAssignment(response.data);
    } catch (error) {
      console.error('Failed to fetch users for assignment:', error);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({ 
      name: '', 
      description: '', 
      status: 'planning',
      project_manager_id: '',
      client_id: '',
      developer_ids: [],
      deadline: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || project.title,
      description: project.description || '',
      status: project.status,
      project_manager_id: project.project_manager_id || '',
      client_id: project.client_id || '',
      developer_ids: project.members?.map(m => m.user_id) || [],
      deadline: project.deadline || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ 
      name: '', 
      description: '', 
      status: 'planning',
      project_manager_id: '',
      client_id: '',
      developer_ids: [],
      deadline: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingProject) {
        // Update existing project
        await axiosInstance.put(`/api/projects/${editingProject.id}`, formData);
      } else {
        // Create new project
        await axiosInstance.post('/api/projects', formData);
      }
      await fetchProjects();
      closeModal();
    } catch (error) {
      console.error('Failed to save project:', error);
      setFormErrors({ submit: 'Failed to save project. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await axiosInstance.delete(`/api/projects/${projectId}`);
      await fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">📁</span> Projects
            </h1>
            <p className="text-gray-500 mt-1">Manage and track all your projects</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="px-6 py-3 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2" 
            style={{background: 'rgb(155 2 50 / 76%)'}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          {/* Filter and View Toggle */}
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredProjects.length > 0 ? (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, idx) => {
                const borderColors = ['border-t-purple-500', 'border-t-pink-500', 'border-t-indigo-500'];
                const iconBgColors = ['bg-purple-50', 'bg-pink-50', 'bg-indigo-50'];
                const iconTextColors = ['text-purple-600', 'text-pink-600', 'text-indigo-600'];
                
                return (
                  <div
                    key={project.id}
                    className={`bg-white border border-gray-200 border-t-4 ${borderColors[idx % 3]} rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${iconBgColors[idx % 3]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <svg className={`w-6 h-6 ${iconTextColors[idx % 3]}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                          </svg>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'in_progress' 
                          ? 'bg-blue-100 text-blue-700' 
                          : project.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : project.status === 'planning'
                          ? 'bg-purple-100 text-purple-700'
                          : project.status === 'review'
                          ? 'bg-yellow-100 text-yellow-700'
                          : project.status === 'on_hold'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {project.name || project.title}
                    </h3>
                    
                    <div 
                      className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: project.description || 'No description provided' }}
                    />
                    
                    {/* Assignment Info */}
                    <div className="space-y-2 mb-4 text-xs">
                      {project.project_manager && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                          </svg>
                          <span>PM: {project.project_manager.name}</span>
                        </div>
                      )}
                      {project.client && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                          </svg>
                          <span>Client: {project.client.name}</span>
                        </div>
                      )}
                      {project.members && project.members.length > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                          </svg>
                          <span>{project.members.length} Developer{project.members.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {project.deadline && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                          </svg>
                          <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditModal(project)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Project</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Team</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Deadline</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProjects.map((project, idx) => {
                      const rowColors = ['hover:bg-purple-50', 'hover:bg-pink-50', 'hover:bg-indigo-50'];
                      const borderColors = ['border-l-purple-500', 'border-l-pink-500', 'border-l-indigo-500'];
                      const iconBgColors = ['bg-purple-50', 'bg-pink-50', 'bg-indigo-50'];
                      const iconTextColors = ['text-purple-600', 'text-pink-600', 'text-indigo-600'];
                      
                      return (
                        <tr 
                          key={project.id} 
                          className={`${rowColors[idx % 3]} transition-colors cursor-pointer group`}
                        >
                          <td className={`py-4 px-6 border-l-4 ${borderColors[idx % 3]}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg ${iconBgColors[idx % 3]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <svg className={`w-5 h-5 ${iconTextColors[idx % 3]}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                                </svg>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                  {project.name || project.title}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1 text-xs text-gray-600">
                              {project.project_manager && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">PM:</span>
                                  <span>{project.project_manager.name}</span>
                                </div>
                              )}
                              {project.client && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Client:</span>
                                  <span>{project.client.name}</span>
                                </div>
                              )}
                              {project.members && project.members.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Devs:</span>
                                  <span>{project.members.length}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {project.deadline ? (
                              <div className="text-sm">
                                <span className="text-gray-700 font-medium">
                                  {new Date(project.deadline).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No deadline</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              project.status === 'in_progress' 
                                ? 'bg-blue-100 text-blue-700' 
                                : project.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : project.status === 'planning'
                                ? 'bg-purple-100 text-purple-700'
                                : project.status === 'review'
                                ? 'bg-yellow-100 text-yellow-700'
                                : project.status === 'on_hold'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => openEditModal(project)}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600" 
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDelete(project.id)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600" 
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Projects Found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Get started by creating your first project'}
          </p>
          <button 
            onClick={openCreateModal}
            className="px-6 py-3 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all" 
            style={{background: 'rgb(155 2 50 / 76%)'}}
          >
            + Create Project
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5" style={{
              maxHeight: 'calc(90vh - 200px)',
              overflowY: 'auto'
            }}>
              <style>
                {`
                  form::-webkit-scrollbar {
                    width: 6px;
                  }
                  form::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                  }
                  form::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                  }
                  form::-webkit-scrollbar-thumb:hover {
                    background: #555;
                  }
                  .ql-container {
                    min-height: 150px;
                  }
                `}
              </style>

              {/* Project Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter project name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description - Rich Text Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <ReactQuill 
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                  placeholder="Enter project description"
                  theme="snow"
                />
              </div>

              {/* Project Manager */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Manager
                </label>
                <select
                  value={formData.project_manager_id}
                  onChange={(e) => setFormData({ ...formData, project_manager_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Select Project Manager --</option>
                  {usersForAssignment.project_managers.map(pm => (
                    <option key={pm.id} value={pm.id}>{pm.name} ({pm.email})</option>
                  ))}
                </select>
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Select Client --</option>
                  {usersForAssignment.clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
                  ))}
                </select>
              </div>

              {/* Developers */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Developers
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {usersForAssignment.developers.length > 0 ? (
                    usersForAssignment.developers.map(dev => (
                      <label key={dev.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.developer_ids.includes(dev.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, developer_ids: [...formData.developer_ids, dev.id] });
                            } else {
                              setFormData({ ...formData, developer_ids: formData.developer_ids.filter(id => id !== dev.id) });
                            }
                          }}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{dev.name} ({dev.email})</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No developers available</p>
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Error Message */}
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {formErrors.submit}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{background: 'rgb(155 2 50 / 76%)'}}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
