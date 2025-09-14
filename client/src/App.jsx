import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Configure axios
axios.defaults.baseURL = 'http://localhost:8000/api';

const App = () => {
  // Auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing'); // landing, login, signup, dashboard
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Navigation helper with smooth transitions
  const navigateTo = (page, delay = 0) => {
    if (page === currentPage) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setError(''); // Clear errors when navigating
      setTimeout(() => setIsTransitioning(false), 100);
    }, delay);
  };

  // Check auth on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigateTo('dashboard');
      fetchNotes();
    } else {
      navigateTo('landing');
    }
    setLoading(false);
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial history state
    if (window.history.state === null) {
      window.history.replaceState({ page: currentPage }, '', `/${currentPage}`);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage]);

  // Update URL when page changes
  useEffect(() => {
    const path = currentPage === 'landing' ? '/' : `/${currentPage}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ page: currentPage }, '', path);
    }
  }, [currentPage]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('/notes');
      setNotes(response.data.notes || []);
      setError('');
    } catch (err) {
      console.error('Fetch notes error:', err);
      setError('Failed to fetch notes');
    }
  };

  const login = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      console.log('Logging in with:', email);
      const response = await axios.post('/users/login', { email, password });
      console.log('Login response:', response.data);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      navigateTo('dashboard', 300); // Smooth transition to dashboard
      fetchNotes();
      
      // Reset form
      setEmail('');
      setPassword('');
      setError('');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      console.log('Registering with:', { name, email, companyName });
      const response = await axios.post('/users/register', {
        name,
        email,
        password,
        companyName
      });

      console.log('Registration response:', response.data);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      navigateTo('dashboard', 300); // Smooth transition to dashboard
      fetchNotes();
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setCompanyName('');
      setError('');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setNotes([]);
    setShowNoteForm(false);
    setShowUpgradeModal(false);
    navigateTo('landing', 200); // Smooth transition back to landing
  };

  const createNote = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Creating note:', { title: noteTitle, content: noteContent });
      const response = await axios.post('/notes', {
        title: noteTitle,
        content: noteContent,
        priority: 'medium'
      });
      
      console.log('Note created:', response.data);
      const newNote = response.data.note;
      setNotes([newNote, ...notes]);
      setNoteTitle('');
      setNoteContent('');
      setShowNoteForm(false);
      setError('');
    } catch (error) {
      console.error('Create note error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create note';
      if (error.response?.status === 403 && errorMsg.includes('limit')) {
        setShowUpgradeModal(true);
      }
      setError(errorMsg);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      console.log('Deleting note:', noteId);
      await axios.delete(`/notes/${noteId}`);
      setNotes(notes.filter(note => note.id !== noteId));
      setError('');
    } catch (error) {
      console.error('Delete note error:', error);
      setError('Failed to delete note');
    }
  };

  const upgradeToProDemo = async () => {
    try {
      console.log('Upgrading tenant:', user?.tenant?.slug);
      if (user?.tenant?.slug) {
        await axios.post(`/tenants/${user.tenant.slug}/upgrade`);
        // Update user data
        const updatedUser = {
          ...user,
          tenant: { ...user.tenant, subscriptionPlan: 'Pro', maxNotes: 999999 }
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowUpgradeModal(false);
        setError('');
        console.log('Upgrade successful');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setError(error.response?.data?.message || 'Failed to upgrade');
    }
  };

  const selectTestAccount = (testEmail) => {
    setEmail(testEmail);
    setPassword('password');
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Landing Page
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
        {/* Navigation */}
        <nav className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-white text-xl font-bold">NotesApp</div>
            <div className="space-x-4">
              <button
                onClick={() => setCurrentPage('login')}
                className="text-white hover:text-purple-200 px-4 py-2"
              >
                Login
              </button>
              <button
                onClick={() => setCurrentPage('signup')}
                className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Multi-Tenant Notes App
            </h1>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Secure, isolated note-taking for teams. Each organization gets their own space with role-based access control and subscription management.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setCurrentPage('signup')}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg"
              >
                Get Started Free
              </button>
              <button
                onClick={() => setCurrentPage('login')}
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-lg font-semibold text-lg"
              >
                Login
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-3">🏢 Multi-Tenant</h3>
              <p className="text-purple-200">Complete data isolation between organizations. Each tenant has their own secure space.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-3">👥 Role-Based Access</h3>
              <p className="text-purple-200">Admin and Member roles with different permissions. Secure access control.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-3">📈 Subscription Plans</h3>
              <p className="text-purple-200">Free plan with 3 notes, Pro plan with unlimited notes. Upgrade anytime.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Page
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-purple-200">Sign in to your account</p>
          </div>

          {/* Test Accounts */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-white font-medium mb-3 text-sm">Demo Accounts:</h3>
            <div className="space-y-2">
              {[
                { email: 'admin@acme.test', label: 'Acme Admin (Pro Plan)' },
                { email: 'user@acme.test', label: 'Acme Member (Pro Plan)' },
                { email: 'admin@globex.test', label: 'Globex Admin (Free Plan)' },
                { email: 'user@globex.test', label: 'Globex Member (Free Plan)' }
              ].map((account) => (
                <button
                  key={account.email}
                  onClick={() => selectTestAccount(account.email)}
                  className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <div className="text-white font-medium text-sm">{account.label}</div>
                  <div className="text-purple-200 text-xs">{account.email}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
              >
                {authLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-gray-600 text-sm">Don't have an account? </span>
              <button
                onClick={() => {
                  setCurrentPage('signup');
                  setError('');
                }}
                className="text-purple-600 hover:text-purple-500 text-sm font-medium"
              >
                Sign up
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentPage('landing')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup Page
  if (currentPage === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-purple-200">Start your organization's notes journey</p>
          </div>

          <div className="bg-white rounded-lg p-6">
            <form onSubmit={signup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
              >
                {authLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-gray-600 text-sm">Already have an account? </span>
              <button
                onClick={() => {
                  setCurrentPage('login');
                  setError('');
                }}
                className="text-purple-600 hover:text-purple-500 text-sm font-medium"
              >
                Sign in
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentPage('landing')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-600">
                {user?.name} ({user?.role})
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {user?.tenant?.name}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                user?.tenant?.subscriptionPlan === 'Pro' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.tenant?.subscriptionPlan} Plan
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Notes</h3>
            <p className="text-3xl font-bold text-purple-600">{notes.length}</p>
            {user?.tenant?.subscriptionPlan === 'Free' && (
              <p className="text-sm text-gray-500 mt-1">Limit: 3 notes</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Organization</h3>
            <p className="text-lg font-semibold text-gray-700">{user?.tenant?.name}</p>
            <p className="text-sm text-gray-500 mt-1">Role: {user?.role}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Plan Status</h3>
            <p className={`text-lg font-semibold ${
              user?.tenant?.subscriptionPlan === 'Pro' ? 'text-yellow-600' : 'text-blue-600'
            }`}>
              {user?.tenant?.subscriptionPlan}
            </p>
            {user?.tenant?.subscriptionPlan === 'Free' && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-sm text-purple-600 hover:text-purple-500 mt-1"
              >
                Upgrade to Pro →
              </button>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Notes</h2>
          <button
            onClick={() => {
              if (user?.tenant?.subscriptionPlan === 'Free' && notes.length >= 3) {
                setShowUpgradeModal(true);
              } else {
                setShowNoteForm(true);
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
          >
            + Add Note
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Create Note Form */}
        {showNoteForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Create New Note</h3>
            <form onSubmit={createNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                >
                  Create Note
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoteForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg">No notes yet</p>
                <p className="mt-2">Create your first note to get started!</p>
              </div>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id || note._id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                  <button
                    onClick={() => deleteNote(note.id || note._id)}
                    className="text-red-500 hover:text-red-700 text-sm ml-2"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{note.content}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full ${
                    note.priority === 'high' ? 'bg-red-100 text-red-700' :
                    note.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {note.priority}
                  </span>
                  <span>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Upgrade to Pro</h2>
            <p className="text-gray-600 mb-4">
              You've reached the Free plan limit of 3 notes. Upgrade to Pro for unlimited notes!
            </p>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">Free Demo</div>
                <div className="text-sm opacity-90">No payment required</div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Maybe Later
              </button>
              {user?.role === 'Admin' && (
                <button
                  onClick={upgradeToProDemo}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Upgrade Now
                </button>
              )}
            </div>
            {user?.role !== 'Admin' && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                Only admins can upgrade the subscription
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
