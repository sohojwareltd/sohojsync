import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MenuIcon, LogoutIcon } from '../components/Icons';
import { getInitials } from '../utils/helpers';
import Button from '../components/Button';
import DrawerMenu from './DrawerMenu';
import NotificationDropdown from '../components/NotificationDropdown';

/**
 * CommonHeader Component
 * Top header bar with user info and actions
 */
const CommonHeader = ({ pageTitle }) => {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="h-14 border-b flex items-center justify-between px-3 md:px-6 bg-white" style={{borderBottomColor: '#e5e7eb',height: '64px'}}>
        {/* Mobile menu button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5 text-gray-700" />
        </button>

        {/* Search Bar (desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l" style={{borderColor: '#e5e7eb'}}>
            <div>
              <p className="text-xs font-medium text-gray-800 text-right">{user?.name}</p>
              <p className="text-xs text-right capitalize text-gray-500">{user?.role}</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold cursor-pointer" style={{background: '#59569D'}}>
              {getInitials(user?.name || '')}
            </div>
          </div>

          {/* Logout button (desktop) */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors"
          >
            <LogoutIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Mobile drawer menu */}
      <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default CommonHeader;
