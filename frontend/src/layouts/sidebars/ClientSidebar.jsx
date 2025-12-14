import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HomeIcon, ProjectsIcon, TasksIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/Icons';
import clsx from 'clsx';

const ClientSidebar = () => {
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

  const navItems = [
    { path: '/client/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/client/projects', icon: ProjectsIcon, label: 'Projects' },
    { path: '/client/tasks', icon: TasksIcon, label: 'Tasks' },
    { path: '/client/calendar', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
      </svg>
    ), label: 'Calendar' },
    { path: '/client/chat', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
      </svg>
    ), label: 'Chat' },
    { path: '/client/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <aside 
      className={clsx(
        'hidden md:flex flex-col border-r transition-all duration-300 bg-white',
        collapsed ? 'w-20' : 'w-64'
      )}
      style={{borderRightColor: '#e5e7eb'}}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b" style={{borderColor: '#e5e7eb'}}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-800">SohojSync</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </div>
        )}
        {!collapsed && (
          <button onClick={toggleCollapsed} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Collapse sidebar">
            <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={toggleCollapsed} className="mx-3 mb-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Expand sidebar">
          <ChevronRightIcon className="w-4 h-4 text-gray-500 mx-auto" />
        </button>
      )}

      <nav className="flex-1 px-3 space-y-3 mt-8">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm',
                isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'
            } : {}}
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-3 border-t" style={{borderColor: '#e5e7eb'}}>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}>
              {user?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{user?.name || 'Client'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'client@example.com'}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ClientSidebar;
