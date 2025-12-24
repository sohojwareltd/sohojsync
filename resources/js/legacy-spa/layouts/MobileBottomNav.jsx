import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, TasksIcon, AddIcon, SettingsIcon } from '../components/Icons';
import clsx from 'clsx';

/**
 * MobileBottomNav Component
 * Bottom navigation bar for mobile devices
 */
const MobileBottomNav = () => {
  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Home' },
    { path: '/tasks', icon: TasksIcon, label: 'Tasks' },
    { path: '/projects', icon: AddIcon, label: 'Projects' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-gray-500'
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
