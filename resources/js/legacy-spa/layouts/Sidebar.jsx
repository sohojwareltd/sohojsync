import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HomeIcon, ProjectsIcon, TasksIcon, SettingsIcon } from '../components/Icons';

/**
 * Minimalistic Sidebar Component
 * Clean and modern navigation sidebar inspired by H-care design with collapse feature
 */
const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const allNavItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Overview', roles: ['admin', 'project_manager', 'developer', 'client'] },
    { path: '/projects', icon: ProjectsIcon, label: 'Projects', roles: ['admin', 'project_manager', 'developer', 'client'] },
    { path: '/tasks', icon: TasksIcon, label: 'Tasks', roles: ['admin', 'project_manager', 'developer', 'client'] },
    { path: '/calendar', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
      </svg>
    ), label: 'Calendar', roles: ['admin', 'project_manager', 'developer', 'client'] },
    { path: '/clients', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>
    ), label: 'Clients', roles: ['admin'] },
    { path: '/employees', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
      </svg>
    ), label: 'Team', roles: ['admin'] },
    { path: '/activity-logs', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
      </svg>
    ), label: 'History', roles: ['admin', 'project_manager'] },
    { path: '/chat', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
      </svg>
    ), label: 'Chat', roles: ['admin', 'project_manager', 'developer', 'client'] },
  ];

  // Settings item rendered separately at the bottom
  const settingsItem = { path: '/settings', icon: SettingsIcon, label: 'Settings', roles: ['admin', 'project_manager', 'developer', 'client'] };

  // Filter nav items by user role
  const navItems = allNavItems.filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <aside 
      className={`hidden md:flex flex-col transition-all duration-300 pt-5 ${collapsed ? 'w-20' : 'w-56'}`}
      style={{
        background: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Logo/Brand */}
      <div className="h-16 flex items-center justify-between px-6">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-secondary shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </div>
            <span className="text-[17px] font-bold text-gray-900" style={{letterSpacing: '-0.01em'}}>SohojSync</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto bg-gradient-to-br from-primary to-secondary shadow-sm">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Collapse sidebar"
          >
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Expand Button when collapsed */}
      {collapsed && (
        <div className="px-3 mb-3">
          <button
            onClick={toggleCollapsed}
            className="w-full p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Expand sidebar"
          >
            <svg className="w-4 h-4 text-gray-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-8 pb-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-600 hover:bg-primary/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  {!collapsed && (
                    <span className={`text-[14px] font-medium ${isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Settings at bottom */}
        {(!settingsItem.roles || settingsItem.roles.includes(user?.role)) && (
          <div className="mt-auto pt-4">
            <NavLink
              to={settingsItem.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-600 hover:bg-primary/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  <settingsItem.icon className="w-5 h-5" />
                </div>
                {!collapsed && (
                  <span className={`text-[14px] font-medium ${isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {settingsItem.label}
                  </span>
                )}
                </>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      {/* Bottom section - User info with screen time (H-care style) */}
      {!collapsed && (
        <div className="p-4">
        <div className="bg-gradient-to-br from-primary/5 to-secondary/10 rounded-2xl p-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm bg-gradient-to-br from-primary to-secondary" 
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-600 capitalize truncate">{user?.role?.replace('_', ' ') || 'Member'}</p>
            </div>
          </div>

          {/* Screen Time */}
          <div className="bg-white/60 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-700">Screen time today</span>
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg font-bold text-primary">4h 32m</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => window.location.href = '/logout'}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-gray-700 shadow-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>
      </div>
      )}
    </aside>
  );
};

export default Sidebar;
