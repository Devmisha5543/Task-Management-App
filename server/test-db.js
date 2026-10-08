require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

console.log('Connecting to:', process.env.MONGODB_URI ? process.env.MONGODB_URI.split('@')[1] : 'No URI');
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('DB_SUCCESS: Connected to MongoDB Atlas successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('DB_ERROR:', err.message);
    process.exit(1);
  });
