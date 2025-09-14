const express = require('express');
const { 
    getTenantInfo, 
    upgradeTenantSubscription, 
    getTenantUsers 
} = require('../controllers/tenantController');
const { 
    authenticateToken, 
    requireAdmin, 
    validateTenantAccess 
} = require('../middlewares/auth');

const router = express.Router();

// GET /tenants/:slug - Get tenant information (requires authentication)
router.get('/:slug', authenticateToken, validateTenantAccess, getTenantInfo);

// POST /tenants/:slug/upgrade - Upgrade subscription (Admin only)
router.post('/:slug/upgrade', authenticateToken, requireAdmin, validateTenantAccess, upgradeTenantSubscription);

// GET /tenants/:slug/users - Get tenant users (Admin only)
router.get('/:slug/users', authenticateToken, requireAdmin, validateTenantAccess, getTenantUsers);

module.exports = router;
