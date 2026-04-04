const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database.');
    
    const users = await User.find({}, 'name email role');
    console.log('Registered Users:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) [${u.role}]`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

listUsers();
