import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import './App.css';

const API_BASE_URL = 'https://yardstick-assignment-7x6c.onrender.com/api';

axios.defaults.baseURL = API_BASE_URL;

function App() {
  const [user, setUser] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const response = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
        setTenantInfo(response.data.tenantInfo);
      } catch (error) {
        console.error('Auth check failed:', error.response?.data?.message || error.message);
        localStorage.removeItem('token');
        setUser(null);
        setTenantInfo(null);
      }
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTenantInfo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} setTenantInfo={setTenantInfo} />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/dashboard" /> : <Signup setUser={setUser} setTenantInfo={setTenantInfo} />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} tenantInfo={tenantInfo} logout={logout} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
