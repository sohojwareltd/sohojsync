import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

/**
 * Clients Page with CRUD operations
 */
const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
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
    setFormData({ name: '', email: '', company: '', phone: '', address: '', website: '', notes: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">👥</span> Clients
            </h1>
            <p className="text-gray-500 mt-1">Manage your client accounts and credentials</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="px-6 py-3 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2" 
            style={{background: 'rgb(155 2 50 / 76%)'}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Client
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
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

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

      {/* Content */}
      {filteredClients.length > 0 ? (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client, idx) => {
                const borderColors = ['border-t-purple-500', 'border-t-pink-500', 'border-t-indigo-500'];
                const iconBgColors = ['bg-purple-50', 'bg-pink-50', 'bg-indigo-50'];
                const iconTextColors = ['text-purple-600', 'text-pink-600', 'text-indigo-600'];
                
                return (
                  <div
                    key={client.id}
                    className={`bg-white border border-gray-200 border-t-4 ${borderColors[idx % 3]} rounded-xl p-6 hover:shadow-xl transition-all group`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${iconBgColors[idx % 3]} flex items-center justify-center text-lg font-bold ${iconTextColors[idx % 3]} group-hover:scale-110 transition-transform`}>
                          {client.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                            {client.user?.name}
                          </h3>
                          <p className="text-xs text-gray-500">{client.user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {client.company && (
                      <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                        </svg>
                        {client.company}
                      </div>
                    )}

                    {client.phone && (
                      <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                        {client.phone}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      <button 
                        onClick={() => openEditModal(client)}
                        className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
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
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Client</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Company</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Phone</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Created</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClients.map((client, idx) => {
                      const rowColors = ['hover:bg-purple-50', 'hover:bg-pink-50', 'hover:bg-indigo-50'];
                      const borderColors = ['border-l-purple-500', 'border-l-pink-500', 'border-l-indigo-500'];
                      
                      return (
                        <tr 
                          key={client.id} 
                          className={`${rowColors[idx % 3]} transition-colors group`}
                        >
                          <td className={`py-4 px-6 border-l-4 ${borderColors[idx % 3]}`}>
                            <div>
                              <p className="font-semibold text-gray-800">{client.user?.name}</p>
                              <p className="text-sm text-gray-500">{client.user?.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-600">{client.company || '-'}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-600">{client.phone || '-'}</p>
                          </td>
                          <td className="py-4 px-6 text-center text-sm text-gray-500">
                            {new Date(client.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => openEditModal(client)}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600" 
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDelete(client.id)}
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
            style={{background: 'rgb(155 2 50 / 76%)'}}
          >
            + Create Client
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingClient ? 'Edit Client' : 'Create New Client'}
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
              {!editingClient && (
                <p className="text-sm text-gray-500 mt-2">
                  📧 Login credentials will be auto-generated and sent to the client's email
                </p>
              )}
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Company Name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Full address"
                  rows="2"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Additional notes"
                  rows="3"
                />
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
