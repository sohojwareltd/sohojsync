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
      <header className="h-20 border-b flex items-center justify-between px-4 md:px-8" style={{background: 'linear-gradient(rgb(61, 45, 80) 0%, rgb(0 0 0 / 22%) 100%)', borderBottomColor: 'rgba(181,110,132,0.2)'}}>
        {/* Mobile menu button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden p-2.5 hover:bg-white hover:bg-opacity-10 rounded-xl transition-all"
          aria-label="Open menu"
        >
          <MenuIcon className="w-6 h-6 text-white" />
        </button>

        {/* Search Bar (desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white border-opacity-10">
            <div>
              <p className="text-sm font-semibold text-white text-right">{user?.name}</p>
              <p className="text-xs text-right capitalize" style={{color: '#E6E9AF'}}>{user?.role}</p>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform" style={{background: 'linear-gradient(135deg, #8EA3A6 0%, #E6E9AF 100%)'}}>
              {getInitials(user?.name || '')}
            </div>
          </div>

          {/* Logout button (desktop) */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-xl text-white font-medium transition-all border border-white border-opacity-20 hover:border-opacity-40"
          >
            <LogoutIcon className="w-5 h-5" />
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
