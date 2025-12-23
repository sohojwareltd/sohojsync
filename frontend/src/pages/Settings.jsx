import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

/**
 * Settings Page
 * User settings and account management
 */
const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="max-w-2xl">
        {/* User Information */}
        <Card className="mb-6">
          <h3 style={{fontSize: '18px', fontFamily: 'Inter, sans-serif'}} className="font-semibold mb-4">Account Information</h3>
          
          <div className="space-y-4">
            <div>
              <label style={{fontSize: '14px', fontFamily: 'Inter, sans-serif'}} className="block font-medium text-gray-700 mb-1">
                Name
              </label>
              <p style={{fontSize: '14px', fontFamily: 'Inter, sans-serif'}} className="text-gray-900">{user?.name}</p>
            </div>

            <div>
              <label style={{fontSize: '14px', fontFamily: 'Inter, sans-serif'}} className="block font-medium text-gray-700 mb-1">
                Email
              </label>
              <p style={{fontSize: '14px', fontFamily: 'Inter, sans-serif'}} className="text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label style={{fontSize: '14px', fontFamily: 'Inter, sans-serif'}} className="block font-medium text-gray-700 mb-1">
                User ID
              </label>
              <p style={{fontSize: '14px', fontFamily: 'Inter, sans-serif'}} className="text-gray-600 font-mono">{user?.id}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button variant="secondary">
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="mb-6">
          <h3 style={{fontSize: '18px', fontFamily: 'Inter, sans-serif'}} className="font-semibold mb-4">Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p style={{fontSize: '14px', fontFamily: 'Inter, sans-serif'}} className="font-medium text-gray-900">Email Notifications</p>
                <p style={{fontSize: '13px', fontFamily: 'Inter, sans-serif'}} className="text-gray-600">Receive email updates about your projects</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Task Reminders</p>
                <p className="text-sm text-gray-600">Get reminded about upcoming due dates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border border-red-200">
          <h3 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Sign Out</p>
                <p className="text-sm text-gray-600">Sign out from your account</p>
              </div>
              <Button variant="danger" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="danger">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
