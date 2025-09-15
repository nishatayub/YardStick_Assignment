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

router.get('/:slug', authenticateToken, validateTenantAccess, getTenantInfo);

router.post('/:slug/upgrade', authenticateToken, requireAdmin, validateTenantAccess, upgradeTenantSubscription);

router.get('/:slug/users', authenticateToken, requireAdmin, validateTenantAccess, getTenantUsers);

module.exports = router;
