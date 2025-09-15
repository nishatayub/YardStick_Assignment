const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yardstick');
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedTestAccounts = async () => {
  try {
    await connectDB();

    let acmeTenant = await Tenant.findOne({ slug: 'acme' });
    if (!acmeTenant) {
      acmeTenant = await Tenant.create({
        name: 'Acme',
        slug: 'acme',
        subscriptionPlan: 'Free',
        maxNotes: 3
      });
      console.log('✓ Created Acme tenant');
    } else {
      console.log('✓ Acme tenant already exists');
    }

    let globexTenant = await Tenant.findOne({ slug: 'globex' });
    if (!globexTenant) {
      globexTenant = await Tenant.create({
        name: 'Globex',
        slug: 'globex',
        subscriptionPlan: 'Free',
        maxNotes: 3
      });
      console.log('✓ Created Globex tenant');
    } else {
      console.log('✓ Globex tenant already exists');
    }
    const hashedPassword = await bcrypt.hash('password', 12);

    const testAccounts = [
      {
        email: 'admin@acme.test',
        password: hashedPassword,
        role: 'Admin',
        tenant: acmeTenant._id,
        firstName: 'Admin',
        lastName: 'Acme',
        name: 'Admin Acme'
      },
      {
        email: 'user@acme.test',
        password: hashedPassword,
        role: 'Member',
        tenant: acmeTenant._id,
        firstName: 'User',
        lastName: 'Acme',
        name: 'User Acme'
      },
      {
        email: 'admin@globex.test',
        password: hashedPassword,
        role: 'Admin',
        tenant: globexTenant._id,
        firstName: 'Admin',
        lastName: 'Globex',
        name: 'Admin Globex'
      },
      {
        email: 'user@globex.test',
        password: hashedPassword,
        role: 'Member',
        tenant: globexTenant._id,
        firstName: 'User',
        lastName: 'Globex',
        name: 'User Globex'
      }
    ];

    for (const account of testAccounts) {
      const existingUser = await User.findOne({ email: account.email });
      if (!existingUser) {
        await User.create(account);
        console.log(`✓ Created test account: ${account.email}`);
      } else {
        console.log(`✓ Test account already exists: ${account.email}`);
      }
    }

    console.log('\n All test accounts created successfully!');
    console.log('\nTest accounts:');
    console.log('- admin@acme.test (Admin, Acme tenant)');
    console.log('- user@acme.test (Member, Acme tenant)');
    console.log('- admin@globex.test (Admin, Globex tenant)');
    console.log('- user@globex.test (Member, Globex tenant)');
    console.log('\nAll passwords: password');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding test accounts:', error);
    process.exit(1);
  }
};

seedTestAccounts();