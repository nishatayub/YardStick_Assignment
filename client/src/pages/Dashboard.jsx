import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import UpgradeModal from '../components/UpgradeModal';
import Sidebar from '../components/Sidebar';

const Dashboard = ({ user, tenantInfo, logout }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const canCreateNote = tenantInfo?.subscriptionPlan === 'Pro' || notes.length < 3;

  const fetchNotes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data.notes || []);
    } catch (err) {
      setError('Failed to load notes');
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (canCreateNote) {
          setShowNoteForm(true);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
      if (e.key === 'Escape') {
        setShowNoteForm(false);
        setEditingNote(null);
        setShowUpgradeModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canCreateNote, sidebarOpen]);

  const handleCreateNote = async (noteData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/notes', noteData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes([response.data.note, ...notes]);
      setShowNoteForm(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create note';
      setError(errorMessage);
      
      if (err.response?.status === 403 && errorMessage.includes('Note limit reached')) {
        setShowUpgradeModal(true);
      }
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/notes/${editingNote._id}`, noteData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.map(note => note._id === editingNote._id ? response.data.note : note));
      setEditingNote(null);
    } catch (error) {
      console.error('Update error:', error);
      setError('Failed to update note');
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete note');
    }
  };

  const handlePriorityFilter = (priority) => {
    setSelectedPriority(priority);
  };

  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
  };

  const handleClearFilters = () => {
    setSelectedPriority('all');
    setSelectedTag(null);
  };

  const filteredNotes = notes.filter(note => {
    const matchesPriority = selectedPriority === 'all' || note.priority === selectedPriority;
    const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag));
    return matchesPriority && matchesTag;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} tenantInfo={tenantInfo} logout={logout} />

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <Sidebar
            notes={notes}
            selectedPriority={selectedPriority}
            selectedTag={selectedTag}
            onPriorityFilter={handlePriorityFilter}
            onTagFilter={handleTagFilter}
            onClearFilters={handleClearFilters}
            onCreateNote={() => setShowNoteForm(true)}
            tenantInfo={tenantInfo}
            user={user}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                {/* Sidebar Toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <div>
                  <h1 className="text-3xl font-light text-black">
                    Notes
                    {(selectedPriority !== 'all' || selectedTag) && (
                      <span className="text-xl text-gray-500 ml-2">
                        • {selectedPriority !== 'all' && `${selectedPriority} priority`}
                        {selectedPriority !== 'all' && selectedTag && ', '}
                        {selectedTag && `#${selectedTag}`}
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {filteredNotes.length} of {notes.length} notes
                    {tenantInfo?.subscriptionPlan === 'Free' ? (
                      <> • Using {notes.length} of 3 notes • <span className="text-black font-medium">Free Plan</span></>
                    ) : (
                      <> • <span className="text-black font-medium">Pro Plan</span></>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {!canCreateNote && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                  >
                    Upgrade to Pro
                  </button>
                )}
                <button
                  onClick={() => setShowNoteForm(true)}
                  disabled={!canCreateNote}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Note</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
                <button 
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600 float-right"
                >
                  ×
                </button>
              </div>
            )}

            {/* Notes Grid */}
            {filteredNotes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {notes.length === 0 
                    ? 'Get started by creating your first note.' 
                    : 'Try adjusting your filters or create a new note.'
                  }
                </p>
                {notes.length === 0 && (
                  <button
                    onClick={() => setShowNoteForm(true)}
                    className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                  >
                    Create your first note
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={setEditingNote}
                    onDelete={handleDeleteNote}
                    onTagClick={handleTagFilter}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {(showNoteForm || editingNote) && (
        <NoteForm
          note={editingNote}
          onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
          onClose={() => {
            setShowNoteForm(false);
            setEditingNote(null);
          }}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          tenantInfo={tenantInfo}
        />
      )}
    </div>
  );
};

export default Dashboard;