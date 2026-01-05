import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

/**
 * Clients Page with CRUD operations - Modern Design (Projects-Style)
 */
const Clients = () => {
  const PRIMARY_COLOR = 'rgb(242, 82, 146)';
  const ACCENT_COLOR = 'rgb(99, 102, 241)';

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    website: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (client.user?.name || '').toLowerCase().includes(searchLower) ||
      (client.user?.email || '').toLowerCase().includes(searchLower) ||
      (client.company || '').toLowerCase().includes(searchLower)
    );
  });

  const openCreateModal = () => {
    setEditingClient(null);
    setProfileImage(null);
    setFormData({ name: '', email: '', company: '', phone: '', address: '', website: '', notes: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setProfileImage(client.user?.avatar || null);
    setFormData({
      name: client.user?.name || '',
      email: client.user?.email || '',
      company: client.company || '',
      phone: client.phone || '',
      address: client.address || '',
      website: client.website || '',
      notes: client.notes || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setProfileImage(null);
    setFormData({ name: '', email: '', company: '', phone: '', address: '', website: '', notes: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingClient) {
        await axiosInstance.put(`/clients/${editingClient.id}`, formData);
      } else {
        await axiosInstance.post('/clients', formData);
      }
      await fetchClients();
      closeModal();
      alert(editingClient ? 'Client updated successfully' : 'Client created and credentials sent via email');
    } catch (error) {
      console.error('Failed to save client:', error);
      setFormErrors({ submit: error.response?.data?.message || 'Failed to save client. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await axiosInstance.delete(`/clients/${clientId}`);
      await fetchClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client. Please try again.');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Clients
        </h1>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between bg-white border border-gray-100 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: ACCENT_COLOR }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{clients.length}</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2 text-sm"
          style={{ background: PRIMARY_COLOR }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Client
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-3 border border-gray-100">
        {/* Controls and Search */}
        <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center justify-end">
          {/* View Controls (left) */}


          {/* Search (right) */}
          <div className="flex-1 md:flex md:justify-end" style={{ maxWidth: '320px' }}>
            <div className="relative w-full">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search clients, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-100 rounded-lg focus:outline-none focus:border-gray-300 hover:border-gray-200 transition-colors text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              style={viewMode === 'grid' ? { background: PRIMARY_COLOR } : {}}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'table'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              style={viewMode === 'table' ? { background: PRIMARY_COLOR } : {}}
              title="Table view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredClients.length > 0 ? (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-white border border-gray-150 rounded-lg p-3 hover:shadow-md transition-all duration-200 group" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: ACCENT_COLOR }}>
                      {client.user?.avatar ? (
                        <img src={client.user.avatar} alt={client.user?.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        client.user?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Client</p>
                      <h3 className="font-semibold text-gray-900 text-sm group-hover:opacity-80 transition-opacity truncate">
                        {client.user?.name}
                      </h3>
                    </div>
                  </div>

                  {client.company && (
                    <div className="mb-2 text-xs text-gray-600">
                      <span className="font-medium text-gray-700">Company:</span> {client.company}
                    </div>
                  )}

                  {client.phone && (
                    <div className="mb-2 text-xs text-gray-600">
                      <span className="font-medium text-gray-700">Phone:</span> {client.phone}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 truncate mb-3">{client.user?.email}</p>

                  <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(client)}
                      className="p-2 rounded-md transition-colors border flex-1"
                      style={{ color: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
                      title="Edit"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 rounded-md transition-colors border flex-1"
                      style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                      title="Delete"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-[16px] shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-[18px] font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>All Clients</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-3 px-4 border-l-2" style={{ borderLeftColor: ACCENT_COLOR }}>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: ACCENT_COLOR }}>
                              {client.user?.avatar ? (
                                <img src={client.user.avatar} alt={client.user?.name} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                client.user?.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                                {client.user?.name}
                              </p>
                              <p className="text-xs text-gray-500">{client.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm">{client.company || '-'}</td>
                        <td className="py-3 px-4 text-gray-700 text-sm">{client.phone || '-'}</td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {new Date(client.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(client)}
                              className="p-2 rounded-lg transition-colors border"
                              style={{ color: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="p-2 rounded-lg transition-colors border"
                              style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Clients Found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first client'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all"
            style={{ background: PRIMARY_COLOR }}
          >
            + Create Client
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-200 flex-shrink-0" style={{ background: ACCENT_COLOR }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingClient ? 'Edit Client' : 'Create New Client'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              {/* Profile Image */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden" style={{ background: ACCENT_COLOR }}>
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      formData.name?.charAt(0).toUpperCase() || '+'
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 rounded-full bg-white border-2 cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: ACCENT_COLOR }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: ACCENT_COLOR }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-400 text-sm ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="John Doe"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-400 text-sm ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="john@example.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                    placeholder="Company Name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                  placeholder="https://example.com"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm resize-none"
                  placeholder="Full address"
                  rows="2"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm resize-none"
                  placeholder="Additional notes"
                  rows="3"
                />
              </div>

              {/* Error Message */}
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                  {formErrors.submit}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all text-sm disabled:opacity-50"
                  style={{ background: PRIMARY_COLOR }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
