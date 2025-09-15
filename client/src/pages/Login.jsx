import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUser, setTenantInfo }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/users/login', formData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setTenantInfo(response.data.user.tenant);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const demoAccounts = [
    { email: 'admin@acme.test', label: 'Acme Admin', org: 'Acme' },
    { email: 'user@acme.test', label: 'Acme Member', org: 'Acme' },
    { email: 'admin@globex.test', label: 'Globex Admin', org: 'Globex' },
    { email: 'user@globex.test', label: 'Globex Member', org: 'Globex' }
  ];

  const loginWithDemo = (email) => {
    setFormData({ email, password: 'password' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <span className="text-xl font-semibold text-black">Notes</span>
          </Link>
          <h2 className="text-3xl font-light text-black">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-black hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Demo Access:</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => loginWithDemo(account.email)}
                  className="text-xs p-2 bg-gray-50 text-gray-700 rounded border hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="font-medium">{account.label}</div>
                  <div className="text-gray-500">{account.org}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">All demo accounts use password: password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;