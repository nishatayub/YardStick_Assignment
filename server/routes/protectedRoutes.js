const express = require('express');
const { authenticateToken, requireAdmin, requireMember } = require('../middlewares/auth');
const router = express.Router();

// Protected route - only accessible by authenticated users
router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'Profile accessed successfully',
        user: req.user
    });
});

// Admin-only route - for inviting users and upgrading subscriptions
router.post('/admin/invite-user', authenticateToken, requireAdmin, (req, res) => {
    res.json({
        message: 'Admin route accessed successfully',
        action: 'User invitation functionality would be here',
        admin: req.user
    });
});

router.post('/admin/upgrade-subscription', authenticateToken, requireAdmin, (req, res) => {
    res.json({
        message: 'Admin route accessed successfully',
        action: 'Subscription upgrade functionality would be here',
        admin: req.user
    });
});

// Member route - for notes CRUD operations (both Members and Admins can access)
router.get('/notes', authenticateToken, requireMember, (req, res) => {
    res.json({
        message: 'Notes retrieved successfully',
        user: req.user,
        notes: [] // This would contain actual notes from the database
    });
});

router.post('/notes', authenticateToken, requireMember, (req, res) => {
    res.json({
        message: 'Note created successfully',
        user: req.user,
        note: req.body // This would create a new note in the database
    });
});

router.put('/notes/:id', authenticateToken, requireMember, (req, res) => {
    res.json({
        message: 'Note updated successfully',
        user: req.user,
        noteId: req.params.id,
        updates: req.body
    });
});

router.delete('/notes/:id', authenticateToken, requireMember, (req, res) => {
    res.json({
        message: 'Note deleted successfully',
        user: req.user,
        noteId: req.params.id
    });
});

module.exports = router;
