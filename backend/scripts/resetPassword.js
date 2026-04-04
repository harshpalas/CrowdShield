const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const emailToReset = process.argv[2];
const newPassword = process.argv[3] || 'admin123';

if (!emailToReset) {
  console.error('Please specify an email: node resetPassword.js example@email.com [newpassword]');
  process.exit(1);
}

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database. Resetting password for:', emailToReset);

    const user = await User.findOne({ email: emailToReset });

    if (user) {
      user.password = newPassword; // The pre-save hook handles hashing
      await user.save();
      console.log(`Success! Password for ${user.email} has been reset to: ${newPassword}`);
    } else {
      console.error('User not found.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Operation Failed:', err.message);
    process.exit(1);
  }
};

reset();
