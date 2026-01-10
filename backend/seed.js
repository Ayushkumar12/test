const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Question = require('./models/Question');
const User = require('./models/User');


const seedData = [];


async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');
    
    // await Question.deleteMany({});
    // console.log('Cleared existing questions...');

    await Question.insertMany(seedData);
    console.log(`${seedData.length} questions seeded successfully!`);

    const adminEmail = 'admin2@example.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user seeded successfully!');
    } else {
      console.log('Admin user already exists.');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();