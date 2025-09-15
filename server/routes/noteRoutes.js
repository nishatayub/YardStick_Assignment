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

router.use(authenticateToken, requireMember);

router.post('/', checkNoteLimit, createNote);

router.get('/', getAllNotes);

router.get('/:id', getNoteById);

router.put('/:id', updateNote);

router.delete('/:id', deleteNote);

module.exports = router;
