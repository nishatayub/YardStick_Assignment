const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
require('dotenv').config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        await User.deleteMany({});
        await Tenant.deleteMany({});
        console.log('Cleared existing users and tenants...');

        const acmeTenant = new Tenant({
            name: 'Acme Corporation',
            slug: 'acme',
            subscriptionPlan: 'Free',
            maxNotes: 3
        });

        const globexTenant = new Tenant({
            name: 'Globex Corporation',
            slug: 'globex',
            subscriptionPlan: 'Free',
            maxNotes: 3
        });

        await acmeTenant.save();
        await globexTenant.save();
        console.log('Tenants created successfully...');

        const hashedPassword = await bcrypt.hash('password', 10);

        const testUsers = [
            {
                email: 'admin@acme.test',
                password: hashedPassword,
                role: 'Admin',
                tenant: acmeTenant._id,
                firstName: 'Admin',
                lastName: 'User'
            },
            {
                email: 'user@acme.test',
                password: hashedPassword,
                role: 'Member',
                tenant: acmeTenant._id,
                firstName: 'Regular',
                lastName: 'User'
            },
            {
                email: 'admin@globex.test',
                password: hashedPassword,
                role: 'Admin',
                tenant: globexTenant._id,
                firstName: 'Admin',
                lastName: 'User'
            },
            {
                email: 'user@globex.test',
                password: hashedPassword,
                role: 'Member',
                tenant: globexTenant._id,
                firstName: 'Regular',
                lastName: 'User'
            }
        ];

        await User.insertMany(testUsers);
        
        console.log('✅ Multi-tenant SaaS setup completed successfully!');
        console.log('\n📋 Test Accounts Created:');
        console.log('- admin@acme.test (Admin, Acme) - password: password');
        console.log('- user@acme.test (Member, Acme) - password: password');
        console.log('- admin@globex.test (Admin, Globex) - password: password');
        console.log('- user@globex.test (Member, Globex) - password: password');
        
        console.log('\n🏢 Tenants Created:');
        console.log('- Acme Corporation (slug: acme, plan: Free, max notes: 3)');
        console.log('- Globex Corporation (slug: globex, plan: Free, max notes: 3)');
        
        console.log('\n🚀 API Endpoints:');
        console.log('- Health: GET /health');
        console.log('- Login: POST /auth/login');
        console.log('- Notes: GET/POST/PUT/DELETE /notes');
        console.log('- Upgrade: POST /tenants/:slug/upgrade');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

seedUsers();
