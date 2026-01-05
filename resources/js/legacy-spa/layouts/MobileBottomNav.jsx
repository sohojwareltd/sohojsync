import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, TasksIcon, SettingsIcon } from '../components/Icons';

const PRIMARY_COLOR = 'rgb(99, 102, 241)';

/**
 * MobileBottomNav Component - H-care inspired
 * Clean bottom navigation bar for mobile devices
 */
const MobileBottomNav = () => {
  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Home' },
    { path: '/projects', icon: () => (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
    ), label: 'Projects' },
    { path: '/tasks', icon: TasksIcon, label: 'Tasks' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50" style={{borderTop: '1px solid #f0f0f0'}}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 rounded-xl ${
                isActive ? '' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-purple-50' 
                    : 'bg-transparent'
                }`}>
                  <item.icon 
                    className="w-6 h-6" 
                    style={{ color: isActive ? PRIMARY_COLOR : '#9CA3AF' }}
                  />
                </div>
                <span 
                  className="text-[11px] mt-0.5 font-medium" 
                  style={{ 
                    color: isActive ? PRIMARY_COLOR : '#9CA3AF',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
