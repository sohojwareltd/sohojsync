import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import CommonHeader from './CommonHeader';
import MobileBottomNav from './MobileBottomNav';

/**
 * MainLayout Component
 * Main application layout with sidebar, header, and content area
 */
const MainLayout = () => {
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path === '/tasks') return 'Tasks';
    if (path === '/settings') return 'Settings';
    return 'SohojSync';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <CommonHeader pageTitle={getPageTitle()} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 bg-gray-100">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation - Mobile */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
