const Tenant = require('../models/Tenant');
const User = require('../models/User');

const getTenantInfo = async (req, res) => {
    try {
        const tenant = req.tenant;
        const Note = require('../models/Note');
        const notesCount = await Note.countDocuments({
            tenant: tenant._id,
            isArchived: false
        });

        res.json({
            message: 'Tenant information retrieved successfully',
            tenant: {
                id: tenant._id,
                name: tenant.name,
                slug: tenant.slug,
                subscriptionPlan: tenant.subscriptionPlan,
                maxNotes: tenant.maxNotes,
                currentNotes: notesCount,
                canCreateMoreNotes: await tenant.canCreateNote(notesCount)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to retrieve tenant information',
            error: error.message 
        });
    }
};

const upgradeTenantSubscription = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const tenant = await Tenant.findOne({ slug, isActive: true });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        if (req.user.tenantSlug !== slug) {
            return res.status(403).json({ 
                message: 'Access denied. You can only upgrade your own tenant.' 
            });
        }

        if (tenant.subscriptionPlan === 'Pro') {
            return res.status(400).json({ 
                message: 'Tenant is already on Pro plan',
                subscriptionPlan: tenant.subscriptionPlan 
            });
        }

        await tenant.upgradeToPro();
        
        res.json({
            message: 'Tenant successfully upgraded to Pro plan',
            tenant: {
                id: tenant._id,
                name: tenant.name,
                slug: tenant.slug,
                subscriptionPlan: tenant.subscriptionPlan,
                maxNotes: tenant.maxNotes,
                upgradedAt: new Date()
            }
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to upgrade tenant subscription',
            error: error.message 
        });
    }
};

const getTenantUsers = async (req, res) => {
    try {
        const { slug } = req.params;
        const tenant = await Tenant.findOne({ slug, isActive: true });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const users = await User.find({ 
            tenant: tenant._id, 
            isActive: true 
        }).select('-password');

        res.json({
            message: 'Tenant users retrieved successfully',
            tenant: {
                name: tenant.name,
                slug: tenant.slug
            },
            users: users.map(user => ({
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt
            }))
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to retrieve tenant users',
            error: error.message 
        });
    }
};

module.exports = {
    getTenantInfo,
    upgradeTenantSubscription,
    getTenantUsers
};
