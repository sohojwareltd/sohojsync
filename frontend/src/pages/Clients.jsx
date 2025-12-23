import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

/**
 * Clients Page with CRUD operations - Modern Design
 */
const Clients = () => {
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
    <div className="p-6 space-y-5" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border" style={{ borderColor: '#e9ecef' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your client accounts and credentials</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2" 
            style={{ background: 'rgb(89, 86, 157)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Client
          </button>
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
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 hover:border-gray-300 transition-colors text-sm"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                viewMode === 'grid'
                  ? 'text-white border'
                  : 'text-gray-700 hover:bg-gray-100 border-gray-300'
              }`}
              style={viewMode === 'grid' ? { background: 'rgb(89, 86, 157)', borderColor: 'rgb(89, 86, 157)' } : {}}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                viewMode === 'table'
                  ? 'text-white border'
                  : 'text-gray-700 hover:bg-gray-100 border-gray-300'
              }`}
              style={viewMode === 'table' ? { background: 'rgb(89, 86, 157)', borderColor: 'rgb(89, 86, 157)' } : {}}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition-all" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold text-white" style={{ background: 'rgb(89, 86, 157)' }}>
                      {client.user?.avatar ? (
                        <img src={client.user.avatar} alt={client.user?.name} className="w-full h-full object-cover" />
                      ) : (
                        client.user?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{client.user?.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{client.user?.email}</p>
                    </div>
                  </div>

                  {client.company && (
                    <div className="mb-3 text-xs text-gray-600">
                      <span className="font-medium">Company:</span> {client.company}
                    </div>
                  )}

                  {client.phone && (
                    <div className="mb-3 text-xs text-gray-600">
                      <span className="font-medium">Phone:</span> {client.phone}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t justify-end" style={{ borderColor: '#e5e7eb' }}>
                    <button 
                      onClick={() => openEditModal(client)}
                      className="py-2 px-3 rounded-lg text-xs font-medium text-white transition-all hover:shadow-sm"
                      style={{ background: 'rgb(89, 86, 157)' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(client.id)}
                      className="py-2 px-3 rounded-lg text-xs font-medium border transition-colors hover:bg-opacity-5"
                      style={{ color: 'rgb(89, 86, 157)', borderColor: 'rgb(89, 86, 157)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium" style={{ borderBottomColor: '#e5e7eb' }}>
                    <tr>
                      <th className="text-left px-4 py-3">Client</th>
                      <th className="text-left px-4 py-3">Company</th>
                      <th className="text-left px-4 py-3">Phone</th>
                      <th className="text-left px-4 py-3">Created</th>
                      <th className="text-center px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-white" style={{ background: 'rgb(89, 86, 157)' }}>
                              {client.user?.avatar ? (
                                <img src={client.user.avatar} alt={client.user?.name} className="w-full h-full object-cover" />
                              ) : (
                                client.user?.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900">{client.user?.name}</p>
                              <p className="text-xs text-gray-500">{client.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{client.company || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{client.phone || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {new Date(client.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(client)}
                              className="p-2 rounded-lg transition-colors text-white"
                              title="Edit"
                              style={{ background: 'rgb(89, 86, 157)' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(client.id)}
                              className="p-2 rounded-lg transition-colors border"
                              title="Delete"
                              style={{ color: 'rgb(89, 86, 157)', borderColor: 'rgb(89, 86, 157)' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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
        <div className="bg-white rounded-xl p-12 text-center border" style={{ borderColor: '#e5e7eb' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(89, 86, 157, 0.1)' }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgb(89, 86, 157)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clients Found</h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first client'}
          </p>
          <button 
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
            style={{ background: 'rgb(89, 86, 157)' }}
          >
            + Create Client
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border" style={{ borderColor: '#e5e7eb' }}>
            {/* Modal Header */}
            <div className="p-6 border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingClient ? 'Edit Client' : 'Create New Client'}
                  </h2>
                  {!editingClient && (
                    <p className="text-xs text-gray-600 mt-1">
                      Login credentials will be auto-generated and sent via email
                    </p>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Profile Image */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden" style={{ background: 'rgb(89, 86, 157)' }}>
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      formData.name?.charAt(0).toUpperCase() || '+'
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 rounded-full bg-white border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: 'rgb(89, 86, 157)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgb(89, 86, 157)' }}>
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-400 text-sm ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-400 text-sm ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
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
              <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
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
                  style={{ background: 'rgb(89, 86, 157)' }}
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
