import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, tenantInfo, logout }) => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">
              Notes<span className="text-indigo-600">Pro</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  tenantInfo?.subscriptionPlan === 'pro' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {tenantInfo?.subscriptionPlan === 'pro' ? 'PRO' : 'FREE'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
