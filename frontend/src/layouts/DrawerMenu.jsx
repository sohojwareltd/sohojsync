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
