import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import CommonHeader from './CommonHeader';
import MobileBottomNav from './MobileBottomNav';

/**
 * MainLayout Component - H-care inspired
 * Clean main application layout with sidebar, header, and content area
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
    <div className="flex h-screen overflow-hidden" style={{background: '#fafbfc'}}>
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <CommonHeader pageTitle={getPageTitle()} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 md:pb-6" style={{background: '#fafbfc', fontFamily: 'Inter, sans-serif'}}>
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation - Mobile */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
