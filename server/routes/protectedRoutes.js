const express = require('express');
const { authenticateToken, requireAdmin, requireMember } = require('../middlewares/auth');
const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id).populate('tenant');
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'Profile accessed successfully',
            user: {
                id: user._id,
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                tenant: {
                    id: user.tenant._id,
                    name: user.tenant.name,
                    slug: user.tenant.slug,
                    subscriptionPlan: user.tenant.subscriptionPlan,
                    maxNotes: user.tenant.maxNotes
                }
            },
            tenantInfo: {
                id: user.tenant._id,
                name: user.tenant.name,
                slug: user.tenant.slug,
                subscriptionPlan: user.tenant.subscriptionPlan,
                maxNotes: user.tenant.maxNotes
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            message: 'Failed to get profile',
            error: error.message
        });
    }
});

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

router.get('/notes', authenticateToken, requireMember, (req, res) => {
    res.json({
        message: 'Notes retrieved successfully',
        user: req.user,
        notes: []
    });
});

router.post('/notes', authenticateToken, requireMember, (req, res) => {
    res.json({
        message: 'Note created successfully',
        user: req.user,
        note: req.body
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
