import React, { useState } from 'react';
import axios from 'axios';

const UpgradeModal = ({ onClose, tenantInfo }) => {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!tenantInfo?.slug) {
      alert('Tenant information not available');
      return;
    }

    try {
      setIsUpgrading(true);
      const token = localStorage.getItem('token');
      await axios.post(`/tenants/${tenantInfo.slug}/upgrade`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Successfully upgraded to Pro plan! You can now create unlimited notes.');
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Upgrade error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upgrade. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-black mb-2">Upgrade to Pro</h2>
            <p className="text-gray-600">
              You've reached your note limit. Upgrade to Pro for unlimited notes and advanced features.
            </p>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-black mb-4">Pro Plan Features:</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited notes
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced formatting
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Team collaboration
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-black">$9<span className="text-lg text-gray-500">/month</span></div>
            <p className="text-sm text-gray-500">Cancel anytime</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className={`flex-1 ${
                isUpgrading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-black hover:bg-gray-800'
              } text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200`}
            >
              {isUpgrading ? 'Upgrading...' : 'Upgrade Now'}
            </button>
            <button
              onClick={onClose}
              disabled={isUpgrading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
