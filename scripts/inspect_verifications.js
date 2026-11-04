const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'stone-market-india/backend/.env' });
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stone-market-india';

mongoose.connect(MONGO_URI).then(async () => {
  const bp = mongoose.connection.db.collection('businessprofiles');
  const total = await bp.countDocuments();
  const byStatus = await bp.aggregate([{ $group: { _id: '$verification_status', count: { $sum: 1 } } }]).toArray();
  const byIsVerified = await bp.aggregate([{ $group: { _id: '$is_verified', count: { $sum: 1 } } }]).toArray();
  console.log(JSON.stringify({ total, byStatus, byIsVerified }, null, 2));
  process.exit(0);
});

