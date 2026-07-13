const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';

  try {
    await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected: ${mongoUri}`);
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message);
    // Retry after a delay - useful when containers start before Mongo is ready
    setTimeout(connectDB, 5000);
  }
}

module.exports = connectDB;
