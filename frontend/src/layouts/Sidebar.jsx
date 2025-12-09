import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HomeIcon, ProjectsIcon, TasksIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import clsx from 'clsx';

/**
 * Sidebar Component
 * Collapsible navigation sidebar for desktop
 */
const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    // Save collapsed state to localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/projects', icon: ProjectsIcon, label: 'Projects' },
    { path: '/tasks', icon: TasksIcon, label: 'Tasks' },
    { path: '/clients', icon: () => (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>
    ), label: 'Clients' },
    { path: '/employees', icon: () => (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
      </svg>
    ), label: 'Employees' },
    { path: '/activity-logs', icon: () => (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
      </svg>
    ), label: 'Activity Logs' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <aside 
      className={clsx(
        'hidden md:flex flex-col border-r transition-all duration-300',
        collapsed ? 'w-20' : 'w-72'
      )}
      style={{background: 'linear-gradient(rgb(61, 45, 80) 0%, rgb(0 0 0 / 22%) 100%)', borderRightColor: 'rgba(181,110,132,0.2)'}}
    >
      {/* Modern Logo/Brand */}
      <div className="h-20 flex items-center justify-between px-6">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgb(155 2 50 / 76%)'}}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SohojSync</h1>
              <p className="text-xs text-gray-400">Project Manager</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto" style={{background: 'rgb(155 2 50 / 76%)'}}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
            aria-label="Collapse sidebar"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-300" />
          </button>
        )}
      </div>

      {/* Expand Button (when collapsed) */}
      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="mx-3 mb-4 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
          aria-label="Expand sidebar"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-300 mx-auto" />
        </button>
      )}

      {/* Modern Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden',
                isActive 
                  ? 'text-white shadow-lg backdrop-blur-md' 
                  : 'hover:bg-white hover:bg-opacity-10'
              )
            }
            style={({ isActive }) => isActive ? {
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white'
            } : {
              color: '#e5e7eb'
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon className={clsx(
                  'w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-white' : 'text-gray-300'
                )} />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <span className="absolute right-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info at Bottom */}
      {!collapsed && (
        <div className="p-4 border-t" style={{borderColor: 'rgba(181,110,132,0.2)'}}>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white bg-opacity-5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{background: 'rgb(155 2 50 / 76%)'}}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-400">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
