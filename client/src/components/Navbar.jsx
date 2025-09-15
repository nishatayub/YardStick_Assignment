import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, tenantInfo, logout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <span className="text-xl font-semibold text-black">Notes</span>
          </Link>
          
          {/* User Menu */}
          <div className="flex items-center space-x-6">
            {/* Tenant Info */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{tenantInfo?.name}</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  tenantInfo?.subscriptionPlan === 'Pro' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  {tenantInfo?.subscriptionPlan}
                </span>
              </div>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {user?.role} • {tenantInfo?.name}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;