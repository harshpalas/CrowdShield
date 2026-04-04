const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config(); // Search in the current working directory (backend)

const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.error('Please specify an email: node promoteAdmin.js example@email.com');
  process.exit(1);
}

const promote = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database. Searching for user:', emailToPromote);

    const user = await User.findOneAndUpdate(
      { email: emailToPromote },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`Success! User ${user.name} (${user.email}) is now an ADMIN.`);
    } else {
      console.error('User not found. Ensure the email is correct and registered.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection Failed:', err.message);
    process.exit(1);
  }
};

promote();
