// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const College  = require('./models/College');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create a test college
  const college = await College.create({
    name:  'IIIT Allahabad',
    slug:  'iiit-allahabad',
    plan:  'growth'
  });
  console.log('College created:', college.name);

  // Create superadmin
  const superadmin = await User.create({
    name:     'Super Admin',
    email:    'admin@voicebot.com',
    password: 'Admin@123',
    role:     'superadmin'
  });
  console.log('Superadmin created:', superadmin.email);

  // Create college admin
  const collegeAdmin = await User.create({
    name:     'College Admin',
    email:    'admin@iiit.ac.in',
    password: 'College@123',
    role:     'college_admin',
    college:  college._id
  });
  console.log('College admin created:', collegeAdmin.email);

  // Create agent
  const agent = await User.create({
    name:     'Agent One',
    email:    'agent@iiit.ac.in',
    password: 'Agent@123',
    role:     'agent',
    college:  college._id
  });
  console.log('Agent created:', agent.email);

  console.log('\n✅ Seed complete. Login credentials:');
  console.log('Superadmin: admin@voicebot.com / Admin@123');
  console.log('College Admin: admin@iiit.ac.in / College@123');
  console.log('Agent: agent@iiit.ac.in / Agent@123');

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});