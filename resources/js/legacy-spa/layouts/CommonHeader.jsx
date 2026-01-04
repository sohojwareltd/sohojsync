import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MenuIcon } from '../components/Icons';
import { getInitials } from '../utils/helpers';
import DrawerMenu from './DrawerMenu';
import NotificationDropdown from '../components/NotificationDropdown';

const PRIMARY_COLOR = 'rgb(89, 86, 157)';

/**
 * CommonHeader Component - H-care inspired minimalistic design
 * Clean top header bar with search, notifications, and user profile
 */
const CommonHeader = ({ pageTitle }) => {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 bg-white" style={{fontFamily: 'Inter, sans-serif'}}>
        {/* Mobile menu button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5 text-gray-700" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
              style={{fontFamily: 'Inter, sans-serif'}}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile Dropdown */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900" style={{fontFamily: 'Inter, sans-serif'}}>{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize" style={{fontFamily: 'Inter, sans-serif'}}>{user?.role?.replace('_', ' ') || 'Member'}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm transition-transform group-hover:scale-105" style={{background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, rgb(109, 106, 177) 100%)`}}>
              {getInitials(user?.name || 'U')}
            </div>
            <svg className="hidden sm:block w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </header>

      {/* Mobile drawer menu */}
      <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default CommonHeader;
