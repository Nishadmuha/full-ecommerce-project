require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

async function createAdmin() {
  try {
    await connectDB();
    
    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin User';
    
    console.log(`\n🔧 Creating admin user...`);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}\n`);
    
    // Check if admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Update existing user to admin
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.isAdmin = true;
      existingUser.password = hashedPassword;
      existingUser.name = name;
      await existingUser.save();
      console.log(`✅ Updated user "${email}" to admin`);
      console.log(`   Password has been updated\n`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        isAdmin: true
      });
      console.log(`✅ Created admin user: ${email}`);
      console.log(`   Password: ${password}\n`);
    }
    
    console.log(`📋 Next steps:`);
    console.log(`   1. Go to http://localhost:5173/login`);
    console.log(`   2. Login with email: ${email}`);
    console.log(`   3. Access admin dashboard at http://localhost:5173/admin\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();






