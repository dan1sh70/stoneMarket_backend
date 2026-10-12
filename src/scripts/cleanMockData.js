require('dotenv').config();
const mongoose = require('mongoose');
const { cleanMockData } = require('./seedMockData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stone_market';

const runClean = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB. Initiating cleanup of all mock data...');
    await cleanMockData();
    console.log('Cleanup complete! Database is now free of mock testing records.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Mock data cleanup failed:', err);
    process.exit(1);
  }
};

runClean();
