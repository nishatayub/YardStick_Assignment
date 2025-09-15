const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Access token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id).populate('tenant');
        if (!user) {
            return res.status(401).json({ message: 'Invalid token - user not found' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'User account is deactivated' });
        }

        if (!user.tenant.isActive) {
            return res.status(401).json({ message: 'Tenant account is deactivated' });
        }

        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            tenant: user.tenant._id,
            tenantSlug: user.tenant.slug,
            tenantName: user.tenant.name,
            subscriptionPlan: user.tenant.subscriptionPlan
        };
        
        req.tenant = user.tenant; 
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        return res.status(500).json({ message: 'Token verification failed' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ 
            message: 'Access denied. Admin role required.' 
        });
    }
    next();
};

const requireMember = (req, res, next) => {
    if (!['Admin', 'Member'].includes(req.user.role)) {
        return res.status(403).json({ 
            message: 'Access denied. Member or Admin role required.' 
        });
    }
    next();
};

const validateTenantAccess = async (req, res, next) => {
    try {
        const { slug } = req.params;
        
        if (!slug) {
            return res.status(400).json({ message: 'Tenant slug is required' });
        }

        if (req.user.tenantSlug !== slug) {
            return res.status(403).json({ 
                message: 'Access denied. You can only access your own tenant data.' 
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Tenant validation failed' });
    }
};

const checkNoteLimit = async (req, res, next) => {
    try {
        const tenant = req.tenant;
        
        if (tenant.subscriptionPlan === 'Pro') {
            return next();
        }

        const Note = require('../models/Note');
        const currentNotesCount = await Note.countDocuments({ 
            tenant: tenant._id,
            isArchived: false 
        });

        if (!await tenant.canCreateNote(currentNotesCount)) {
            return res.status(403).json({
                message: 'Note limit reached. Upgrade to Pro plan for unlimited notes.',
                currentNotes: currentNotesCount,
                maxNotes: tenant.maxNotes,
                subscriptionPlan: tenant.subscriptionPlan
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Note limit check failed' });
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireMember,
    validateTenantAccess,
    checkNoteLimit
};
