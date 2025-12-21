import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../hooks/useAuth';

/**
 * Projects Page
 * Modern design with CRUD operations
 */
const getRolePrefix = (role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'project_manager':
      return '/manager';
    case 'developer':
      return '/developer';
    case 'client':
      return '/client';
    default:
      return '';
  }
};

const Projects = () => {
  const { user } = useAuth();
  const rolePrefix = getRolePrefix(user?.role);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning',
    project_manager_id: '',
    client_id: '',
    developer_ids: [],
    deadline: '',
    attachments: [],
    existingAttachments: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [usersForAssignment, setUsersForAssignment] = useState({
    project_managers: [],
    developers: [],
    clients: []
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProjects();
    fetchUsersForAssignment();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/projects');
      // Laravel paginate returns data in response.data.data
      let projectsData = response.data.data || response.data;
      
      // Ensure it's an array
      if (!Array.isArray(projectsData)) {
        projectsData = Array.isArray(projectsData.data) ? projectsData.data : [];
      }
      
      console.log('=== FULL API RESPONSE ===', response.data);
      
      // Calculate progress for each project
      const projectsWithProgress = projectsData.map(project => {
        // Prefer tasks array if present; fallback to counts from API
        const tasks = Array.isArray(project.tasks) ? project.tasks : [];
        const totalTasks = tasks.length > 0 ? tasks.length : (project.tasks_count || 0);
        const completedTasks = tasks.length > 0
          ? tasks.filter(t => ['completed', 'done', 'resolved'].includes(String(t.status || '').toLowerCase())).length
          : (project.completed_tasks_count || 0);
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Debug logging - show raw field values
        console.log(`Project: "${project.name || project.title}"`, {
          tasks_count: project.tasks_count,
          completed_tasks_count: project.completed_tasks_count,
          totalTasks,
          completedTasks,
          calculatedProgress: progress,
          hasProgressField: 'progress' in project,
          apiProgress: project.progress
        });
        
        return {
          ...project,
          progress,
          total_tasks: totalTasks,
          completed_tasks: completedTasks
        };
      });
      // Role-based visibility: show only assigned projects
      const filterByRole = (p) => {
        const role = user?.role;
        if (!role || role === 'admin') return true;
        if (role === 'client') return p.client_id === user?.id || p.client?.id === user?.id;
        if (role === 'project_manager') return p.project_manager_id === user?.id || p.project_manager?.id === user?.id;
        if (role === 'developer') {
          const members = Array.isArray(p.members) ? p.members : [];
          return members.some(m => m.user_id === user?.id || m.id === user?.id);
        }
        return true;
      };

      setProjects(projectsWithProgress.filter(filterByRole));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersForAssignment = async () => {
    try {
      const response = await axiosInstance.get('/projects/users-for-assignment');
      setUsersForAssignment(response.data);
    } catch (error) {
      console.error('Failed to fetch users for assignment:', error);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({ 
      title: '', 
      description: '', 
      status: 'planning',
      project_manager_id: '',
      client_id: '',
      developer_ids: [],
      deadline: '',
      attachments: [],
      existingAttachments: []
    });
    setFormErrors({});
    setUploadProgress({});
    setShowModal(true);
  };

  const openEditModal = async (project) => {
    // Fetch full project details including attachments
    try {
      const response = await axiosInstance.get(`/projects/${project.id}`);
      const fullProject = response.data;
      
      setEditingProject(fullProject);
      setFormData({
        title: fullProject.title || fullProject.name,
        description: fullProject.description || '',
        status: fullProject.status,
        project_manager_id: fullProject.project_manager_id || '',
        client_id: fullProject.client_id || '',
        developer_ids: fullProject.members?.map(m => m.user_id) || [],
        deadline: fullProject.deadline || '',
        attachments: [], // New attachments to upload
        existingAttachments: fullProject.attachments || [] // Existing attachments from DB
      });
      setFormErrors({});
      setUploadProgress({});
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching project details:', error);
      alert('Failed to load project details');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ 
      title: '', 
      description: '', 
      status: 'planning',
      project_manager_id: '',
      client_id: '',
      developer_ids: [],
      deadline: '',
      attachments: [],
      existingAttachments: []
    });
    setFormErrors({});
    setUploadProgress({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Project title is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      // Add file to attachments
      const fileObj = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploaded: false,
        progress: 0
      };
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, fileObj] }));
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (fileId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== fileId)
    }));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
        </svg>
      );
    }
    if (fileType.includes('pdf')) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
      </svg>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
  };

  const statusTabs = [
    { label: 'All Projects', value: 'all' },
    { label: 'Current', value: 'current' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' }
  ];

  const statusMatchesTab = (project, tab) => {
    const status = project.status;
    if (tab === 'all') return true;
    if (tab === 'current') return ['in_progress'].includes(status);
    if (tab === 'pending') return ['planning', 'review', 'on_hold'].includes(status);
    if (tab === 'completed') return status === 'completed';
    if (tab === 'failed') return ['cancelled', 'failed'].includes(status);
    return status === tab;
  };

  const getTabCount = (tab) => projects.filter(p => statusMatchesTab(p, tab)).length;

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'planning':
      case 'review':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'on_hold':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      case 'cancelled':
      case 'failed':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-purple-50 text-purple-700 border border-purple-200';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let projectData = { ...formData };
      delete projectData.attachments;

      let projectResponse;
      if (editingProject) {
        // Update existing project
        projectResponse = await axiosInstance.put(`/projects/${editingProject.id}`, projectData);
      } else {
        // Create new project
        projectResponse = await axiosInstance.post('/projects', projectData);
      }

      const newProjectId = projectResponse.data.data?.id || projectResponse.data.id;

      // Upload attachments
      if (formData.attachments && formData.attachments.length > 0) {
        console.log('Starting file uploads, count:', formData.attachments.length);
        for (const attachment of formData.attachments) {
          console.log('Processing attachment:', attachment.name, 'Has file:', !!attachment.file);
          // Only upload if it has a file object and hasn't been uploaded yet
          if (attachment.file && !attachment.uploaded) {
            const attachmentFormData = new FormData();
            attachmentFormData.append('file', attachment.file);
            attachmentFormData.append('project_id', newProjectId);
            attachmentFormData.append('file_name', attachment.name);

            console.log('Uploading file:', attachment.name, 'to project:', newProjectId);

            try {
              const uploadResponse = await axiosInstance.post('/projects/upload-attachment', attachmentFormData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                  const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setUploadProgress(prev => ({
                    ...prev,
                    [attachment.id]: progress
                  }));
                }
              });
              console.log('File uploaded successfully:', uploadResponse.data);
            } catch (error) {
              console.error(`Failed to upload ${attachment.name}:`, error);
              console.error('Error response:', error.response?.data);
              alert(`Failed to upload file: ${attachment.name}`);
            }
          }
        }
      } else {
        console.log('No attachments to upload');
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

  const [deleteModal, setDeleteModal] = useState({ show: false, projectId: null, projectTitle: '' });

  const openDeleteModal = (project) => {
    setDeleteModal({ show: true, projectId: project.id, projectTitle: project.title || project.name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, projectId: null, projectTitle: '' });
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/projects/${deleteModal.projectId}`);
      await fetchProjects();
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusMatchesTab(project, filterStatus);
    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'progress') {
      return (b.progress || 0) - (a.progress || 0);
    }
    if (sortBy === 'deadline') {
      const aDate = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    }
    if (sortBy === 'name') {
      return (a.name || a.title || '').localeCompare(b.name || b.title || '');
    }
    return 0;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Projects
        </h1>
        <p className="text-sm text-gray-500">Manage and track all your projects</p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background: 'rgb(89, 86, 157)'}}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Total Projects</p>
            <p className="text-xl font-bold text-gray-900">{filteredProjects.length}</p>
          </div>
        </div>
        {(user?.role !== 'project_manager' && user?.role !== 'developer') && (
          <button 
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-lg font-medium text-white shadow-sm hover:shadow-md hover:opacity-90 transition-all flex items-center gap-2" 
            style={{background: 'rgb(89, 86, 157)', fontSize: '14px'}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Project
          </button>
        )}
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-2 rounded-lg border transition-colors text-sm font-medium flex items-center gap-2 ${
                filterStatus === tab.value
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              style={filterStatus === tab.value ? {background: 'rgb(89, 86, 157)'} : {}}
            >
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${filterStatus === tab.value ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
                {getTabCount(tab.value)}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 hover:border-gray-300 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Sort & View Controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 hover:border-gray-300 transition-colors text-sm bg-white"
              style={{minWidth: '150px'}}
            >
              <option value="deadline">Deadline</option>
              <option value="progress">Progress</option>
              <option value="name">Name</option>
            </select>

            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={viewMode === 'grid' ? {background: 'rgb(89, 86, 157)'} : {}}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={viewMode === 'table' ? {background: 'rgb(89, 86, 157)'} : {}}
                title="Table view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProjects.map((project, idx) => {
                const daysUntil = project.deadline ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                const isOverdue = project.deadline && new Date(project.deadline) < new Date();
                const avatarItems = [];
                if (project.project_manager) {
                  avatarItems.push({ 
                    name: project.project_manager.name, 
                    id: project.project_manager.id,
                    role: 'project-manager',
                    roleLabel: 'Project Manager',
                    from: '#7c3aed', 
                    to: '#6366f1' 
                  });
                }
                if (project.client) {
                  avatarItems.push({ 
                    name: project.client.name, 
                    id: project.client.id,
                    role: 'client',
                    roleLabel: 'Client',
                    from: '#059669', 
                    to: '#10b981' 
                  });
                }
                if (project.members && project.members.length > 0) {
                  project.members.slice(0, 2).forEach((member) => {
                    avatarItems.push({ 
                      name: member.name || member.full_name || member.username || 'Dev', 
                      id: member.user_id || member.id,
                      role: 'developer',
                      roleLabel: 'Developer',
                      from: '#111827', 
                      to: '#1f2937' 
                    });
                  });
                }
                const extraMembers = Math.max(0, (project.members?.length || 0) - 2);
                const totalTeam = avatarItems.length + (extraMembers > 0 ? extraMembers : 0);
                
                return (
                  <div
                    key={project.id}
                    onClick={() => (window.location.href = `${rolePrefix}/projects/${project.id}`)}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm" style={{background: 'rgb(89, 86, 157)'}}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Project</p>
                          <h3 className="font-semibold text-gray-900 text-sm group-hover:opacity-80 transition-opacity">
                            {project.name || project.title}
                          </h3>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(project.status)}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {project.description && (
                      <div 
                        className="text-xs text-gray-600 mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: project.description }}
                      />
                    )}

                    {project.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-600">Progress</span>
                          <span className="text-xs font-semibold" style={{color: 'rgb(89, 86, 157)'}}>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{ width: `${project.progress || 0}%`, background: 'rgb(89, 86, 157)' }}
                          >
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {avatarItems.map((item, avatarIdx) => (
                            <a
                              key={`${item.name}-${avatarIdx}`}
                              href={`${rolePrefix}/users/${item.role}/${item.id}`}
                              onClick={(e) => e.stopPropagation()}
                              title={`${item.name} - ${item.roleLabel}`}
                              className="w-8 h-8 rounded-full bg-gradient-to-br text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"
                              style={{ backgroundImage: `linear-gradient(135deg, ${item.from}, ${item.to})` }}
                            >
                              {getInitials(item.name)}
                            </a>
                          ))}
                          {extraMembers > 0 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center border-2 border-white">+{extraMembers}</div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">Team {totalTeam}</span>
                      </div>

                      {project.deadline && (
                        <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                          isOverdue
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : daysUntil <= 3
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-xs">{isOverdue ? 'Overdue' : daysUntil <= 3 ? 'Due soon' : 'Deadline'}</span>
                          </div>
                          <div className="font-semibold text-xs mt-0.5">
                            {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-200">
                      <a 
                        href={`${rolePrefix}/projects/${project.id}/tasks`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-lg font-medium text-white shadow-sm hover:shadow-md hover:opacity-90 flex items-center gap-1.5 transition-all text-xs"
                        style={{background: 'rgb(89, 86, 157)'}}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM15 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM5 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 11a1 1 0 10-2 0v3.586L9.707 13.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L13 14.586V11z"/>
                        </svg>
                        View Tasks
                      </a>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
                        <button 
                          onClick={(e) => { e.preventDefault(); openEditModal(project); }}
                          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-700 border border-gray-200"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); openDeleteModal(project); }}
                          className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-gray-500 hover:text-red-600 border border-gray-200"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-white rounded-[16px] shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-[18px] font-bold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>All Projects</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Team</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Progress</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Deadline</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{borderColor: '#e5e7eb'}}>
                    {sortedProjects.map((project, idx) => {
                      const daysUntil = project.deadline ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                      const isOverdue = project.deadline && new Date(project.deadline) < new Date();
                      
                      return (
                        <tr 
                          key={project.id} 
                          className="hover:bg-gray-50 transition-colors group"
                          onClick={() => window.location.href = `${rolePrefix}/projects/${project.id}`}
                          style={{cursor: 'pointer'}}
                        >
                          <td className="py-3 px-4 border-l-2" style={{borderLeftColor: '#59569D'}}>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: '#59569D'}}>
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                  {project.name || project.title}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1.5 text-sm text-gray-600">
                              {project.project_manager && (
                                <a
                                  href={`${rolePrefix}/users/project-manager/${project.project_manager.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 group"
                                >
                                  <svg className="w-3.5 h-3.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0z"/>
                                  </svg>
                                  <div>
                                    <span className="text-xs text-gray-500">PM:</span>
                                    <span className="ml-1 font-bold text-purple-700 text-sm group-hover:text-purple-900 group-hover:underline">{project.project_manager.name}</span>
                                  </div>
                                </a>
                              )}
                              {project.client && (
                                <a
                                  href={`${rolePrefix}/users/client/${project.client.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 group"
                                >
                                  <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                  </svg>
                                  <div>
                                    <span className="text-xs text-gray-500">Client:</span>
                                    <span className="ml-1 font-bold text-blue-700 text-sm group-hover:text-blue-900 group-hover:underline">{project.client.name}</span>
                                  </div>
                                </a>
                              )}
                              {project.members && project.members.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Devs:</span>
                                  <span>{project.members.length}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {project.progress !== undefined ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 h-full transition-all duration-500 relative overflow-hidden"
                                      style={{ width: `${project.progress || 0}%` }}
                                    >
                                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                    </div>
                                  </div>
                                  <span className="text-sm font-bold text-purple-600">{project.progress}%</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {project.deadline ? (
                              <div className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                isOverdue 
                                  ? 'bg-red-50 text-red-700 border-red-300'
                                  : daysUntil <= 3 
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                    : 'bg-blue-50 text-blue-700 border-blue-300'
                              }`}>
                                <div className="flex items-center gap-1">
                                  {isOverdue && '⚠️'}
                                  {daysUntil <= 3 && !isOverdue && '⏰'}
                                  {daysUntil > 3 && '📅'}
                                  <span>
                                    {new Date(project.deadline).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No deadline</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                              project.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-300' :
                              project.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                              project.status === 'planning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                              project.status === 'on_hold' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                              'bg-purple-100 text-purple-700 border border-purple-300'
                            }`}>
                              {project.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openEditModal(project); }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                                title="Edit"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); openDeleteModal(project); }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                                title="Delete"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          {(user?.role !== 'project_manager' && user?.role !== 'developer') && (
          <button 
            onClick={openCreateModal}
            className="px-6 py-3 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all" 
            style={{background: 'rgb(155 2 50 / 76%)'}}
          >
            + Create Project
          </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-200 flex-shrink-0" style={{background: '#59569D'}}>
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#888 #f1f1f1'
            }}>
              <style>
                {`
                  .flex-1::-webkit-scrollbar {
                    width: 6px;
                  }
                  .flex-1::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                  }
                  .flex-1::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                  }
                  .flex-1::-webkit-scrollbar-thumb:hover {
                    background: #555;
                  }
                  .ql-container {
                    min-height: 180px;
                  }
                  .ql-editor {
                    min-height: 180px;
                  }
                `}
              </style>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Project Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base ${
                      formErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter project title"
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>

                {/* Row 2: Description - Rich Text Editor */}
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

                {/* Row 3: Project Manager and Client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Manager
                    </label>
                    <select
                      value={formData.project_manager_id}
                      onChange={(e) => setFormData({ ...formData, project_manager_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                    >
                      <option value="">-- Select Project Manager --</option>
                      {usersForAssignment.project_managers.map(pm => (
                        <option key={pm.id} value={pm.id}>{pm.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Client
                    </label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                    >
                      <option value="">-- Select Client --</option>
                      {usersForAssignment.clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Developers */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign Developers
                  </label>
                  
                  {/* Selected Developers Display */}
                  {formData.developer_ids.length > 0 && (
                    <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-purple-900">
                          {formData.developer_ids.length} Developer{formData.developer_ids.length > 1 ? 's' : ''} Selected
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, developer_ids: [] })}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.developer_ids.map(devId => {
                          const dev = usersForAssignment.developers.find(d => d.id === devId);
                          return dev ? (
                            <span key={devId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-sm text-gray-700">
                              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                              {dev.name}
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, developer_ids: formData.developer_ids.filter(id => id !== devId) })}
                                className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Developers Selection List */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <div className="max-h-64 overflow-y-auto" style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#888 #f1f1f1'
                    }}>
                      <style>
                        {`
                          .max-h-64::-webkit-scrollbar {
                            width: 6px;
                          }
                          .max-h-64::-webkit-scrollbar-track {
                            background: #f1f1f1;
                          }
                          .max-h-64::-webkit-scrollbar-thumb {
                            background: #888;
                            border-radius: 10px;
                          }
                        `}
                      </style>
                      {usersForAssignment.developers.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {usersForAssignment.developers.map(dev => {
                            const isSelected = formData.developer_ids.includes(dev.id);
                            return (
                              <label 
                                key={dev.id} 
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 hover:bg-purple-50 transition-colors ${
                                  isSelected ? 'bg-purple-50' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({ ...formData, developer_ids: [...formData.developer_ids, dev.id] });
                                    } else {
                                      setFormData({ ...formData, developer_ids: formData.developer_ids.filter(id => id !== dev.id) });
                                    }
                                  }}
                                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                                      {dev.name}
                                    </span>
                                    {isSelected && (
                                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                      </svg>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">{dev.email}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-8">No developers available</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Select Options */}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, developer_ids: usersForAssignment.developers.map(d => d.id) })}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, developer_ids: [] })}
                      className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Row 5: File Attachments */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Attachments
                  </label>
                  
                  {/* Upload Area */}
                  <div 
                    className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                    <svg className="w-12 h-12 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF or any file up to 10MB</p>
                  </div>

                  {/* Existing Attachments (from database) */}
                  {formData.existingAttachments && formData.existingAttachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">
                          📎 {formData.existingAttachments.length} Existing File{formData.existingAttachments.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto bg-blue-50 p-3 rounded-lg border border-blue-200">
                        {formData.existingAttachments.map((attachment) => (
                          <div key={attachment.id} className="bg-white border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {getFileIcon(attachment.file_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{attachment.file_name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</p>
                              <p className="text-xs text-blue-600 mt-0.5">Uploaded</p>
                            </div>
                            <a
                              href={`${import.meta.env.VITE_APP_URL || ''}/storage/${attachment.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 p-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Download file"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                              </svg>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attached Files List */}
                  {formData.attachments && formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">
                          📤 {formData.attachments.length} New File{formData.attachments.length > 1 ? 's' : ''} to Upload
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, attachments: [] })}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove All
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                        {formData.attachments.map((attachment) => (
                          <div key={attachment.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
                            <div className="flex-shrink-0">
                              {getFileIcon(attachment.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{attachment.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                              {uploadProgress[attachment.id] && uploadProgress[attachment.id] < 100 && (
                                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-purple-500 h-full transition-all"
                                    style={{ width: `${uploadProgress[attachment.id]}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(attachment.id)}
                              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remove file"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 6: Deadline and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deadline
                    </label>
                    <div className="relative group">
                      <style>
                        {`
                          input[type="date"]::-webkit-calendar-picker-indicator {
                            opacity: 0;
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            cursor: pointer;
                          }
                          input[type="date"] {
                            appearance: none;
                            -webkit-appearance: none;
                          }
                        `}
                      </style>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base transition-all hover:border-purple-400 group-hover:shadow-md"
                          style={{
                            cursor: 'pointer'
                          }}
                          placeholder="Select deadline date"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    {formData.deadline && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-purple-900">Selected Deadline</p>
                            <p className="text-sm font-semibold text-purple-700">
                              {new Date(formData.deadline).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, deadline: '' })}
                            className="p-1.5 hover:bg-white rounded-lg transition-colors"
                            title="Clear deadline"
                          >
                            <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                    >
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Error Message */}
                {formErrors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {formErrors.submit}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors text-base"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  style={{background: 'rgb(155 2 50 / 76%)'}}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Delete Project</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <p className="text-sm text-gray-600 mb-3">You are about to delete:</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-900">{deleteModal.projectTitle}</p>
              </div>
              <p className="text-xs text-gray-500">
                All associated data including tasks, members, and files will be permanently deleted.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={closeDeleteModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-lg font-medium text-white transition-colors"
                style={{background: 'rgb(155 2 50 / 76%)'}}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Projects;
