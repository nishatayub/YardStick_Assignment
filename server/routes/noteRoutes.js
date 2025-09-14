const express = require('express');
const { 
    createNote, 
    getAllNotes, 
    getNoteById, 
    updateNote, 
    deleteNote 
} = require('../controllers/noteController');
const { 
    authenticateToken, 
    requireMember, 
    checkNoteLimit 
} = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication and member/admin role
router.use(authenticateToken, requireMember);

// POST /notes – Create a note (with subscription limit check)
router.post('/', checkNoteLimit, createNote);

// GET /notes – List all notes for the current tenant
router.get('/', getAllNotes);

// GET /notes/:id – Retrieve a specific note
router.get('/:id', getNoteById);

// PUT /notes/:id – Update a note
router.put('/:id', updateNote);

// DELETE /notes/:id – Delete a note
router.delete('/:id', deleteNote);

module.exports = router;
