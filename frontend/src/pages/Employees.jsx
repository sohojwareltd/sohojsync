import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

/**
 * Employees Page - Manage developers and project managers
 */
const Employees = () => {
  const APP_URL = import.meta.env.VITE_APP_URL || '';
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'developer',
    profile_image: null,
    date_of_birth: '',
    joining_date: '',
    designation: '',
    salary: '',
    address: '',
    phone: '',
    emergency_contact: '',
    cv: null,
    notes: '',
  });

  useEffect(() => {
    fetchEmployees();
    fetchStatistics();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get('/employees/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedEmployee) {
        await axiosInstance.post(`/employees/${selectedEmployee.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { _method: 'PUT' }
        });
        showAlert('Employee updated successfully!');
      } else {
        const response = await axiosInstance.post('/employees', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showAlert(`Employee created! Password: ${response.data.password} (Also sent to email)`, 'success', 10000);
      }
      
      closeModal();
      fetchEmployees();
      fetchStatistics();
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to save employee', 'error');
    }
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.user.name}?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/employees/${employee.id}`);
      showAlert('Employee deleted successfully!');
      fetchEmployees();
      fetchStatistics();
    } catch (error) {
      showAlert('Failed to delete employee', 'error');
    }
  };

  const openCreateModal = () => {
    setSelectedEmployee(null);
    setFormData({
      name: '',
      email: '',
      role: 'developer',
      profile_image: null,
      date_of_birth: '',
      joining_date: '',
      designation: '',
      salary: '',
      address: '',
      phone: '',
      emergency_contact: '',
      cv: null,
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.user.name,
      email: employee.user.email,
      role: employee.user.role,
      profile_image: null,
      date_of_birth: employee.date_of_birth || '',
      joining_date: employee.joining_date || '',
      designation: employee.designation || '',
      salary: employee.salary || '',
      address: employee.address || '',
      phone: employee.phone || '',
      emergency_contact: employee.emergency_contact || '',
      cv: null,
      notes: employee.notes || '',
    });
    setShowModal(true);
  };

  const openProfileModal = (employee) => {
    setSelectedEmployee(employee);
    setShowProfileModal(true);
  };

  const goToUserDetails = (employee) => {
    const role = employee?.user?.role || '';
    const type = role === 'project_manager' ? 'project-manager' : role;
    const userId = employee?.user?.id;
    const viewerRole = user?.role;
    const prefix = viewerRole === 'admin'
      ? '/admin'
      : viewerRole === 'project_manager'
      ? '/manager'
      : viewerRole === 'developer'
      ? '/developer'
      : viewerRole === 'client'
      ? '/client'
      : '';
    if (userId) {
      navigate(`${prefix}/users/${type}/${userId}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowProfileModal(false);
    setSelectedEmployee(null);
  };

  const showAlert = (message, type = 'success', duration = 3000) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), duration);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-5">
      {/* Alert */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-[8px] shadow-lg ${
          alert.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Team Members</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your team members and their roles</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all shadow-md hover:shadow-lg"
          style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-[16px] p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.total_employees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[16px] p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">Developers</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.developers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[16px] p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">Project Managers</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.project_managers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[16px] p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-gray-800">{Math.round(statistics.avg_performance)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Controls */}
      <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-gray-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Table View"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Employees Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee, idx) => {
            const roleColors = {
              'admin': 'bg-purple-100 text-purple-700',
              'project_manager': 'bg-blue-100 text-blue-700',
              'developer': 'bg-green-100 text-green-700',
              'client': 'bg-pink-100 text-pink-700'
            };
            const roleColor = roleColors[employee.user.role] || 'bg-gray-100 text-gray-700';
            
            return (
              <div
                key={employee.id}
                className="bg-white rounded-[16px] shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
              >
                <div className="p-5">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center mb-4">
                    {employee.profile_image ? (
                      <img
                        src={`${APP_URL}/storage/${employee.profile_image}`}
                        alt={employee.user.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 mb-3"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 border-4 border-gray-100" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                        {employee.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="text-base font-bold text-gray-800 mb-1">{employee.user.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{employee.designation || employee.user.email}</p>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${roleColor}`}>
                      {employee.user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Bio/Notes */}
                  {employee.notes && (
                    <p className="text-xs text-gray-600 text-center mb-4 line-clamp-2 px-2">
                      {employee.notes}
                    </p>
                  )}

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Projects</p>
                      <p className="text-sm font-bold text-gray-800">{employee.total_projects || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Tasks</p>
                      <p className="text-sm font-bold text-gray-800">{employee.total_tasks || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Performance</p>
                      <p className="text-sm font-bold text-gray-800">{employee.performance_score}%</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToUserDetails(employee)}
                      className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all"
                      style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => openEditModal(employee)}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Employees Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-[16px] shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-700 uppercase tracking-wide">Employee</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-700 uppercase tracking-wide">Role</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-700 uppercase tracking-wide">Designation</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-700 uppercase tracking-wide">Performance</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-700 uppercase tracking-wide">Joined</th>
                  <th className="text-right py-3 px-5 text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                                  const roleColors = {
                                    'admin': 'bg-purple-100 text-purple-700',
                                    'project_manager': 'bg-blue-100 text-blue-700',
                                    'developer': 'bg-green-100 text-green-700',
                                    'client': 'bg-pink-100 text-pink-700'
                                  };
                                  const roleColor = roleColors[employee.user.role] || 'bg-gray-100 text-gray-700';

                {filteredEmployees.map((employee, idx) => {
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          {employee.profile_image ? (
                            <img
                              src={`${APP_URL}/storage/${employee.profile_image}`}
                              alt={employee.user.name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                              {employee.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{employee.user.name}</p>
                            <p className="text-xs text-gray-500">{employee.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${roleColor}`}>
                          {employee.user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-sm text-gray-700">{employee.designation || '-'}</td>
                      <td className="py-3 px-5">
                        <span className="text-sm font-bold text-gray-800">{employee.performance_score}%</span>
                      </td>
                      <td className="py-3 px-5 text-xs text-gray-600">
                        {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => goToUserDetails(employee)}
                            className="px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => openEditModal(employee)}
                            className="px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(employee)}
                            className="px-2 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Delete
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700" style={{background: '#59569D', color: '#fff'}}>
              <h2 className="text-2xl font-bold text-white">
                {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
              .employees-modal-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .employees-modal-scroll::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
              }
              .employees-modal-scroll::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 3px;
              }
              .employees-modal-scroll::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
            `}} />
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] employees-modal-scroll">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <FilePond
                    files={formData.profile_image ? [formData.profile_image] : []}
                    onupdatefiles={(fileItems) => {
                      setFormData({...formData, profile_image: fileItems[0]?.file || null});
                    }}
                    allowMultiple={false}
                    maxFiles={1}
                    acceptedFileTypes={['image/jpeg', 'image/png', 'image/jpg', 'image/gif']}
                    maxFileSize="2MB"
                    labelIdle='Drag & Drop profile image or <span class="filepond--label-action">Browse</span>'
                    labelFileTypeNotAllowed="Invalid file type"
                    fileValidateTypeLabelExpectedTypes="Expects JPEG, PNG, JPG, or GIF"
                    labelMaxFileSizeExceeded="File is too large"
                    labelMaxFileSize="Maximum file size is 2MB"
                    credits={false}
                    stylePanelLayout="compact circle"
                    imagePreviewHeight={170}
                    imageCropAspectRatio="1:1"
                    imageResizeTargetWidth={200}
                    imageResizeTargetHeight={200}
                    stylePanelAspectRatio="1:1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="developer">Developer</option>
                    <option value="project_manager">Project Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({...formData, joining_date: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CV Upload</label>
                  <FilePond
                    files={formData.cv ? [formData.cv] : []}
                    onupdatefiles={(fileItems) => {
                      setFormData({...formData, cv: fileItems[0]?.file || null});
                    }}
                    allowMultiple={false}
                    maxFiles={1}
                    acceptedFileTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                    maxFileSize="5MB"
                    labelIdle='Drag & Drop your CV or <span class="filepond--label-action">Browse</span>'
                    labelFileTypeNotAllowed="Invalid file type"
                    fileValidateTypeLabelExpectedTypes="Expects PDF, DOC, or DOCX"
                    labelMaxFileSizeExceeded="File is too large"
                    labelMaxFileSize="Maximum file size is 5MB"
                    credits={false}
                    stylePanelLayout="compact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2.5 rounded-lg text-white font-medium transition-colors"
                  style={{background: '#59569D'}}
                >
                  {selectedEmployee ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gray-800 text-white p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                {selectedEmployee.profile_image ? (
                  <img
                    src={`${APP_URL}/storage/${selectedEmployee.profile_image}`}
                    alt={selectedEmployee.user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">
                    {selectedEmployee.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{selectedEmployee.user.name}</h2>
                  <p className="text-gray-300">{selectedEmployee.user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Role</p>
                  <p className="font-medium text-gray-800 capitalize">{selectedEmployee.user.role.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Designation</p>
                  <p className="font-medium text-gray-800">{selectedEmployee.designation || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                  <p className="font-medium text-gray-800">
                    {selectedEmployee.date_of_birth ? new Date(selectedEmployee.date_of_birth).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Joining Date</p>
                  <p className="font-medium text-gray-800">
                    {selectedEmployee.joining_date ? new Date(selectedEmployee.joining_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-800">{selectedEmployee.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Emergency Contact</p>
                  <p className="font-medium text-gray-800">{selectedEmployee.emergency_contact || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Salary</p>
                  <p className="font-medium text-gray-800">{selectedEmployee.salary ? `$${selectedEmployee.salary}` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Promotion</p>
                  <p className="font-medium text-gray-800">
                    {selectedEmployee.last_promotion_date ? new Date(selectedEmployee.last_promotion_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-medium text-gray-800">{selectedEmployee.address || '-'}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Completed Tasks</p>
                    <p className="text-2xl font-bold text-gray-800">{selectedEmployee.tasks_completed}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Rejected Tasks</p>
                    <p className="text-2xl font-bold text-gray-800">{selectedEmployee.tasks_rejected}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Client Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-800">{selectedEmployee.client_satisfaction_points}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Performance Score</p>
                    <p className="text-2xl font-bold text-gray-800">{selectedEmployee.performance_score}%</p>
                  </div>
                </div>
              </div>

              {selectedEmployee.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-2">Notes</h3>
                  <p className="text-gray-700">{selectedEmployee.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{background: '#59569D20'}}>
            <svg className="w-8 h-8" style={{color: '#59569D'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No Employees Found</h3>
          <p className="text-gray-500 text-sm">Start by adding your first employee</p>
        </div>
      )}
    </div>
  );
};

export default Employees;
