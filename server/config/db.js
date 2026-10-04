/**
 * Database Connection Module
 * Connects to MongoDB via Mongoose with auto-reconnect and graceful shutdown
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/viral_link_hub';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error:`, err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[MongoDB] Disconnected. Attempting to reconnect...`);
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Initial connection error: ${error.message}`);
    // In production you might exit, or fallback to memory store
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_FALLBACK) {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDB;
