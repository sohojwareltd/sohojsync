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
      <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-white" style={{borderBottomColor: '#e3e8ef', fontFamily: 'Inter, sans-serif', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}>
        {/* Mobile menu button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-[8px] transition-colors"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5 text-gray-700" />
        </button>

        {/* Search Bar (desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-lg">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search for something..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[8px] text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
              style={{fontFamily: 'Inter, sans-serif'}}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l" style={{borderColor: '#e9ecef'}}>
            <div>
              <p className="text-[13px] font-semibold text-gray-900 text-right" style={{fontFamily: 'Inter, sans-serif'}}>{user?.name}</p>
              <p className="text-[11px] text-right capitalize text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>{user?.role?.replace('_', ' ')}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-semibold cursor-pointer shadow-sm" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              {getInitials(user?.name || '')}
            </div>
          </div>

          {/* Logout button (desktop) */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-[8px] text-gray-700 text-[14px] font-medium transition-colors"
            style={{fontFamily: 'Inter, sans-serif'}}
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
