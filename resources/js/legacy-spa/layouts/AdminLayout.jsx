import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './sidebars/AdminSidebar';
import CommonHeader from './CommonHeader';
import MobileBottomNav from './MobileBottomNav';

/**
 * AdminLayout - H-care inspired clean layout
 */
const AdminLayout = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard') return 'Dashboard';
    if (path === '/admin/projects') return 'Projects';
    if (path === '/admin/tasks') return 'Tasks';
    if (path === '/admin/settings') return 'Settings';
    return 'SohojSync';
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{background: '#fafbfc'}}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CommonHeader pageTitle={getPageTitle()} />
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 md:pb-6" style={{background: '#fafbfc', fontFamily: 'Inter, sans-serif'}}>
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default AdminLayout;
