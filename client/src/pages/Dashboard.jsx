import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import UpgradeModal from '../components/UpgradeModal';

const Dashboard = ({ user, tenantInfo, logout }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();

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

  const handleCreateNote = async (noteData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/notes', noteData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes([response.data.note, ...notes]);
      setShowNoteForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create note');
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/notes/${editingNote._id}`, noteData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.map(note => note._id === editingNote._id ? response.data : note));
      setEditingNote(null);
    } catch (err) {
      console.error('Update error:', err);
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
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete note');
    }
  };

  const canCreateNote = tenantInfo?.subscriptionPlan === 'pro' || notes.length < 3;

  const handleNewNoteClick = () => {
    if (canCreateNote) {
      setShowNoteForm(true);
    } else {
      setShowUpgradeModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} tenantInfo={tenantInfo} logout={logout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Notes</h1>
            <p className="text-gray-600 mt-1">
              {tenantInfo?.subscriptionPlan === 'free' ? (
                `${notes.length}/3 notes used - ${user?.role === 'admin' ? 'Admin' : 'Member'}`
              ) : (
                `${notes.length} notes - ${user?.role === 'admin' ? 'Admin' : 'Member'}`
              )}
            </p>
          </div>
          <button
            onClick={handleNewNoteClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
        </div>

        {/* Subscription Warning */}
        {!canCreateNote && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-yellow-800">Upgrade to Pro</h3>
                <p className="mt-1 text-yellow-700">
                  You've reached the free plan limit of 3 notes. Upgrade to Pro for unlimited notes and advanced features!
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No notes yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Create your first note to start organizing your thoughts and ideas
            </p>
            <button
              onClick={handleNewNoteClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Create Your First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={setEditingNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </div>

      {/* Note Form Modal */}
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

      {/* Upgrade Modal */}
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
