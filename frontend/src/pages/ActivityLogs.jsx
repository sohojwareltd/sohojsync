import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

/**
 * Activity Logs Page
 * Track all user activities with filters
 */
const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    action: 'all',
    search: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axiosInstance.get(`/api/activity-logs?${params}`);
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get('/api/activity-logs/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchUserReport = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch user-specific logs
      const logsResponse = await axiosInstance.get(`/api/activity-logs?user_id=${userId}`);
      const userLogsData = logsResponse.data.data || [];
      setUserLogs(userLogsData);

      // Calculate user statistics
      const stats = {
        total: userLogsData.length,
        today: userLogsData.filter(log => {
          const today = new Date().toDateString();
          return new Date(log.created_at).toDateString() === today;
        }).length,
        byAction: userLogsData.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {}),
        lastActivity: userLogsData[0]?.created_at,
        mostCommonAction: null
      };

      // Find most common action
      if (Object.keys(stats.byAction).length > 0) {
        stats.mostCommonAction = Object.entries(stats.byAction)
          .sort((a, b) => b[1] - a[1])[0][0];
      }

      setUserStats(stats);
      setShowUserModal(true);
    } catch (error) {
      console.error('Failed to fetch user report:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setUserLogs([]);
    setUserStats(null);
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-700';
      case 'update': return 'bg-blue-100 text-blue-700';
      case 'delete': return 'bg-red-100 text-red-700';
      case 'view': return 'bg-gray-100 text-gray-700';
      case 'login': return 'bg-purple-100 text-purple-700';
      case 'logout': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'project_manager': return 'bg-blue-100 text-blue-700';
      case 'developer': return 'bg-green-100 text-green-700';
      case 'client': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">📊</span> Activity Logs
          </h1>
          <p className="text-gray-500 mt-1">Track all user activities and system events</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-purple-500">
              <p className="text-sm text-gray-600 mb-1">Total Activities</p>
              <p className="text-3xl font-bold text-purple-600">{statistics.total_activities}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-emerald-500">
              <p className="text-sm text-gray-600 mb-1">Today's Activities</p>
              <p className="text-3xl font-bold text-emerald-600">{statistics.today_activities}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-blue-600">{statistics.by_role?.length || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-rose-500">
              <p className="text-sm text-gray-600 mb-1">Action Types</p>
              <p className="text-3xl font-bold text-rose-600">{statistics.by_action?.length || 0}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activities by Action - Bar Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
                Activities by Action Type
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.by_action || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="action" tick={{fill: '#666'}} />
                  <YAxis tick={{fill: '#666'}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px'}}
                    cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Activities by Role - Pie Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                Activities by User Role
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.by_role || []}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.role}: ${entry.count}`}
                  >
                    {(statistics.by_role || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#8B5CF6', '#F25292', '#7C3AED', '#EC4899', '#A855F7'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search activities..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="project_manager">Project Manager</option>
            <option value="developer">Developer</option>
            <option value="client">Client</option>
          </select>

          {/* Action Filter */}
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Action</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">IP Address</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length > 0 ? (
                logs.map((log, idx) => {
                  const borderColors = ['border-l-purple-500', 'border-l-pink-500', 'border-l-indigo-500', 'border-l-blue-500'];
                  
                  return (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-gray-50 transition-colors border-l-4 ${borderColors[idx % 4]}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                            {log.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{log.user?.name || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500">{log.user?.email || '-'}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedUser(log.user);
                              fetchUserReport(log.user_id);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="View user report"
                          >
                            View Report
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(log.user_role)}`}>
                          {log.user_role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-700">{log.description}</p>
                        {log.event_type && (
                          <p className="text-xs text-gray-400 mt-1">{log.event_type}</p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-mono text-gray-600">{log.ip_address || '-'}</p>
                          {log.user_agent && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-xs" title={log.user_agent}>
                              {log.user_agent.split(' ')[0]}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-600">
                          {new Date(log.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleDateString('en-US', { year: 'numeric' })}
                        </p>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No Activity Logs Found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Report Modal */}
      {showUserModal && selectedUser && userStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gray-800 text-white p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">
                    {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                    <p className="text-gray-300">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={closeUserModal}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Total Activities</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.total}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Today</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.today}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Most Common</p>
                <p className="text-lg font-bold text-gray-800 capitalize">{userStats.mostCommonAction || '-'}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Last Activity</p>
                <p className="text-xs font-medium text-gray-800">
                  {userStats.lastActivity ? new Date(userStats.lastActivity).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>

            {/* Action Breakdown */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Action Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Action Pie Chart */}
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={Object.entries(userStats.byAction).map(([action, count]) => ({
                          name: action,
                          value: count
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        labelLine={false}
                      >
                        {Object.keys(userStats.byAction).map((action, index) => {
                          const colors = {
                            'create': '#10B981',
                            'update': '#3B82F6', 
                            'delete': '#EF4444',
                            'view': '#6B7280',
                            'login': '#8B5CF6',
                            'logout': '#F97316'
                          };
                          return <Cell key={`cell-${index}`} fill={colors[action] || '#F25292'} />;
                        })}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Action Badges */}
                <div className="flex flex-wrap gap-2 content-center">
                  {Object.entries(userStats.byAction).map(([action, count]) => (
                    <div
                      key={action}
                      className={`px-3 py-1.5 rounded-lg ${getActionBadgeColor(action)} flex items-center gap-2`}
                    >
                      <span className="font-medium capitalize">{action}</span>
                      <span className="bg-white bg-opacity-50 px-2 py-0.5 rounded text-xs font-bold">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Timeline Chart */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Activity Timeline (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={(() => {
                  // Group logs by date for last 7 days
                  const last7Days = [];
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const count = userLogs.filter(log => {
                      const logDate = new Date(log.created_at).toDateString();
                      return logDate === date.toDateString();
                    }).length;
                    last7Days.push({ date: dateStr, activities: count });
                  }
                  return last7Days;
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{fill: '#666', fontSize: 12}} />
                  <YAxis tick={{fill: '#666', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px'}}
                    cursor={{stroke: '#8B5CF6', strokeWidth: 2}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activities" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{fill: '#F25292', r: 5}}
                    activeDot={{r: 7, fill: '#F25292'}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Timeline */}
            <div className="p-6 overflow-y-auto max-h-96">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {userLogs.slice(0, 20).map((log, idx) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{log.description}</p>
                      {log.event_type && (
                        <p className="text-xs text-gray-500 mt-0.5">{log.event_type}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-600">
                        {new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{log.ip_address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeUserModal}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
