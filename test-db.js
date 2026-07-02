require('dotenv').config();
const mongoose = require('mongoose');

// Import your schemas
const User = require('./models/User');
const College = require('./models/College');

async function testDatabase() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Create a test College
    // const testCollege = new College({
    //   name: 'IIIT Allahabad',
    //   slug: 'iiita',
    //   contactEmail: 'admin@iiita.ac.in',
    //   plan: 'enterprise'
    // });
    
    // const savedCollege = await testCollege.save();
    // console.log('✅ Successfully saved College:', savedCollege.name);

    // 3. Create a test Super Admin
    const testAdmin = new User({
      name: 'Super Admin Tamanna',
      email: 'tamanna@admitcall.com',
      password: 'temporarypassword123', // We aren't encrypting yet, just testing!
      role: 'superadmin'
    });

    const savedAdmin = await testAdmin.save();
    console.log('✅ Successfully saved Super Admin:', savedAdmin.name);

    console.log('🎉 Database Test Complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database Test Failed:', error);
    process.exit(1);
  }
}

testDatabase();