import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HomeIcon, ProjectsIcon, TasksIcon, SettingsIcon, LogoutIcon, CloseIcon } from '../components/Icons';
import clsx from 'clsx';

/**
 * DrawerMenu Component
 * Full-screen drawer menu for mobile navigation
 */
const DrawerMenu = ({ open, onClose }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/projects', icon: ProjectsIcon, label: 'Projects' },
    { path: '/tasks', icon: TasksIcon, label: 'Tasks' },
    { path: '/calendar', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
      </svg>
    ), label: 'Calendar' },
    { path: '/clients', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>
    ), label: 'Clients' },
    { path: '/employees', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
      </svg>
    ), label: 'Employees' },
    { path: '/activity-logs', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
      </svg>
    ), label: 'Activity Logs' },
    { path: '/chat', icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
      </svg>
    ), label: 'Chat' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-80 bg-primary text-white z-50 transform transition-transform duration-300 md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-accent">
          <h1 className="text-xl font-bold">SohojSync</h1>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-6 py-4 text-white hover:bg-accent transition-colors',
                  isActive && 'bg-accent'
                )
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="ml-4 font-medium">{item.label}</span>
            </NavLink>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-4 text-white hover:bg-accent transition-colors mt-4 border-t border-accent"
          >
            <LogoutIcon className="w-6 h-6" />
            <span className="ml-4 font-medium">Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default DrawerMenu;
