import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const ACCENT_COLOR = '#7c3aed';
const ACTION_COLOR = '#6366f1';

/**
 * Settings Page
 * User settings and account management with admin user management
 */
const Settings = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    password: false,
    preferences: false,
    users: false,
  });

  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Users state (for admin)
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'project_manager', status: 'active' },
  ]);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserModal, setEditUserModal] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      console.log('Saving profile:', profileData);
      // await axiosInstance.put(`/users/${user?.id}`, profileData);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      console.log('Changing password');
      // await axiosInstance.post(`/users/${user?.id}/change-password`, passwordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    setLoading(true);
    try {
      console.log('Saving user:', editingUser);
      setEditUserModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ section, title }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <svg 
        className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
      </svg>
    </button>
  );

  return (
    <div className="space-y-4" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and system preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <SectionHeader section="profile" title="Profile Settings" />
        
        {expandedSections.profile && (
          <>
            <div className="px-6 py-6 space-y-6 border-b border-gray-100">
              {/* User Avatar */}
              <div className="flex items-start gap-6 pb-6 border-b border-gray-100">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
                  style={{background: `linear-gradient(135deg, ${ACCENT_COLOR}, ${ACTION_COLOR})`}}
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{user?.email}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold capitalize">
                      {user?.role?.replace('_', ' ')}
                    </span>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50 text-sm"
                style={{background: ACTION_COLOR}}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Password Section */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <SectionHeader section="password" title="Change Password" />
        
        {expandedSections.password && (
          <>
            <div className="px-6 py-6 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-xs text-blue-700 font-medium">
                  💡 Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-6 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50 text-sm"
                style={{background: ACTION_COLOR}}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Preferences Section */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <SectionHeader section="preferences" title="Notification Preferences" />
        
        {expandedSections.preferences && (
          <>
            <div className="px-6 py-6 space-y-4 border-b border-gray-100">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-600 mt-1">Receive updates about projects and tasks</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div 
                    className="w-12 h-7 bg-gray-300 rounded-full peer transition-all"
                    style={{background: ACTION_COLOR}}
                  >
                    <div 
                      className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform"
                      style={{transform: 'translateX(24px)'}}
                    ></div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900">Task Reminders</p>
                  <p className="text-xs text-gray-600 mt-1">Get reminded about upcoming deadlines</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div 
                    className="w-12 h-7 bg-gray-300 rounded-full peer transition-all"
                    style={{background: ACTION_COLOR}}
                  >
                    <div 
                      className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform"
                      style={{transform: 'translateX(24px)'}}
                    ></div>
                  </div>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg font-medium text-white transition-all text-sm"
                style={{background: ACTION_COLOR}}
              >
                Save Preferences
              </button>
            </div>
          </>
        )}
      </div>

      {/* User Management Section (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
          <SectionHeader section="users" title="User Management" />
          
          {expandedSections.users && (
            <>
              <div className="px-6 py-6">
                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Role</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-600">{u.email}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-2.5 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold capitalize">
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditUserModal(true);
                                }}
                                className="p-2 rounded-lg transition-colors hover:bg-purple-50"
                                style={{color: ACCENT_COLOR}}
                                title="Edit user"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                              <button
                                className="p-2 rounded-lg transition-colors hover:bg-red-50 text-red-600"
                                title="Delete user"
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
            </>
          )}
        </div>
      )}

      {/* Danger Zone Section */}
      <div className="bg-white border-2 border-red-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-red-200 bg-red-50">
          <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
        </div>

        <div className="px-6 py-6 space-y-3">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
            <div>
              <p className="font-semibold text-red-900 text-sm">Sign Out</p>
              <p className="text-xs text-red-700 mt-1">Sign out from your account</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-medium text-white transition-all text-sm"
              style={{background: '#ef4444'}}
            >
              Sign Out
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
            <div>
              <p className="font-semibold text-red-900 text-sm">Delete Account</p>
              <p className="text-xs text-red-700 mt-1">Permanently delete your account and all data</p>
            </div>
            <button
              className="px-4 py-2 rounded-lg font-medium text-white transition-all text-sm"
              style={{background: '#ef4444'}}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUserModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200" style={{background: ACCENT_COLOR}}>
              <h2 className="text-lg font-bold text-white">Edit User</h2>
              <p className="text-purple-100 text-xs mt-1">Update user information and password</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="developer">Developer</option>
                  <option value="client">Client</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-700 font-medium">
                  Leave password fields empty to keep the current password
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">New Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave empty to keep current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setEditUserModal(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 rounded-lg font-medium text-white transition-all text-sm"
                style={{background: ACTION_COLOR}}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              max-height: 0;
            }
            to {
              opacity: 1;
              max-height: 1000px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Settings;
