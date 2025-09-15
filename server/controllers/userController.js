const User = require('../models/User');
const Tenant = require('../models/Tenant');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signup = async (req, res) => {
    try {
        const { email, password, role, tenantSlug, firstName, lastName } = req.body;
        
        if (!email) {
            return res.status(400).json({message: "Please provide an email!"});
        }
        if (!password) {
            return res.status(400).json({message: "Please provide a password!"});
        }
        if (!tenantSlug) {
            return res.status(400).json({message: "Please provide a tenant slug!"});
        }

        const tenant = await Tenant.findOne({ slug: tenantSlug, isActive: true });
        if (!tenant) {
            return res.status(400).json({message: "Invalid tenant!"});
        }

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "User Already Exists!"});
        }
        
        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hash,
            role: role || 'Member',
            tenant: tenant._id,
            firstName,
            lastName
        });
        
        await newUser.save();
        await newUser.populate('tenant');
        
        const token = jwt.sign({
            id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            tenant: newUser.tenant._id,
            tenantSlug: newUser.tenant.slug
        }, process.env.JWT_SECRET, {expiresIn: '24h'});
        
        return res.status(200).json({
            message: "User creation successful...", 
            token: token,
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                tenant: {
                    id: newUser.tenant._id,
                    name: newUser.tenant.name,
                    slug: newUser.tenant.slug,
                    subscriptionPlan: newUser.tenant.subscriptionPlan
                }
            }
        });
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email) {
            return res.status(400).json({message: "Please provide an email!"});
        }
        if (!password) {
            return res.status(400).json({message: "Please provide a password!"});
        }
        
        const existingUser = await User.findOne({email, isActive: true}).populate('tenant');
        if (!existingUser) {
            return res.status(400).json({message: "User Does Not Exist!"});
        }

        if (!existingUser.tenant.isActive) {
            return res.status(400).json({message: "Tenant account is deactivated!"});
        }
        
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({message: "Invalid Credentials!"});
        }
        
        const token = jwt.sign({
            id: existingUser._id,
            email: existingUser.email,
            role: existingUser.role,
            tenant: existingUser.tenant._id,
            tenantSlug: existingUser.tenant.slug
        }, process.env.JWT_SECRET, {expiresIn: '24h'});
        
        return res.status(200).json({
            message: "Login Successful...",
            token: token,
            user: {
                id: existingUser._id,
                name: existingUser.name || `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim() || existingUser.email.split('@')[0],
                email: existingUser.email,
                role: existingUser.role,
                tenant: {
                    id: existingUser.tenant._id,
                    name: existingUser.tenant.name,
                    slug: existingUser.tenant.slug,
                    subscriptionPlan: existingUser.tenant.subscriptionPlan,
                    maxNotes: existingUser.tenant.maxNotes
                }
            }
        });
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password, companyName } = req.body;
        
        if (!name) {
            return res.status(400).json({message: "Please provide a name!"});
        }
        if (!email) {
            return res.status(400).json({message: "Please provide an email!"});
        }
        if (!password) {
            return res.status(400).json({message: "Please provide a password!"});
        }
        if (!companyName) {
            return res.status(400).json({message: "Please provide a company name!"});
        }

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "User Already Exists!"});
        }
        const tenantSlug = companyName.toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        const existingTenant = await Tenant.findOne({ slug: tenantSlug });
        if (existingTenant) {
            return res.status(400).json({message: "Company already exists! Please choose a different company name."});
        }
        
        const newTenant = new Tenant({
            name: companyName,
            slug: tenantSlug,
            subscriptionPlan: 'Free',
            maxNotes: 3,
            isActive: true
        });
        
        await newTenant.save();
        
        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hash,
            role: 'Admin',
            tenant: newTenant._id,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' '),
            name: name
        });
        
        await newUser.save();
        await newUser.populate('tenant');
        
        const token = jwt.sign({
            id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            tenant: newUser.tenant._id,
            tenantSlug: newUser.tenant.slug
        }, process.env.JWT_SECRET, {expiresIn: '24h'});
        
        return res.status(200).json({
            message: "Registration successful...", 
            token: token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                tenant: {
                    id: newUser.tenant._id,
                    name: newUser.tenant.name,
                    slug: newUser.tenant.slug,
                    subscriptionPlan: newUser.tenant.subscriptionPlan,
                    maxNotes: newUser.tenant.maxNotes
                }
            }
        });
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

const inviteUser = async (req, res) => {
    try {
        const { email, role, firstName, lastName } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const validRoles = ['Admin', 'Member'];
        const userRole = role || 'Member';
        if (!validRoles.includes(userRole)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        const newUser = new User({
            email,
            password: hashedPassword,
            role: userRole,
            tenant: req.user.tenant,
            firstName: firstName || '',
            lastName: lastName || '',
            name: `${firstName || ''} ${lastName || ''}`.trim()
        });

        await newUser.save();
        await newUser.populate('tenant', 'name slug subscriptionPlan');

        res.status(201).json({
            message: 'User invited successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                tenant: {
                    name: newUser.tenant.name,
                    slug: newUser.tenant.slug
                },
                createdAt: newUser.createdAt
            },
            temporaryPassword: tempPassword 
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to invite user',
            error: error.message
        });
    }
};

module.exports = { signup, login, register, inviteUser };