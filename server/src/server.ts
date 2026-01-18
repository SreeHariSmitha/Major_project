import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createApp } from './app.js';

/**
 * Load environment variables
 */
dotenv.config();

/**
 * Server Configuration
 */
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-validator';

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected');

    // Create and start Express app
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
