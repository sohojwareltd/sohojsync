import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ClientSidebar from './sidebars/ClientSidebar';
import CommonHeader from './CommonHeader';
import MobileBottomNav from './MobileBottomNav';

const ClientLayout = () => {
  const location = useLocation();

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
      <ClientSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CommonHeader pageTitle={getPageTitle()} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 bg-gray-100">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default ClientLayout;
