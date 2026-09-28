require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
const BusinessProfile = require('./src/models/BusinessProfile');
const Product = require('./src/models/Product');
const MiningCategory = require('./src/models/MiningCategory');
const HomeBanner = require('./src/models/HomeBanner');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stonemarket_test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedDatabase = async () => {
  try {
    console.log('Seeding full database...');

    // Clear existing
    await User.deleteMany({});
    await BusinessProfile.deleteMany({});
    await Product.deleteMany({});
    await MiningCategory.deleteMany({});
    await HomeBanner.deleteMany({});

    // Seed User
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await User.create({
      mobile: '9999999999',
      password: passwordHash,
      role: 'vendor',
      status: 'active',
      isVerified: true
    });
    console.log('Created User: 9999999999 / password123');

    // Seed Business
    const business = await BusinessProfile.create({
      userId: user._id,
      company_name: 'Test Granite Mining Co.',
      business_type: 'mining',
      status: 'active',
      isPublic: true,
      owners: [{ name: 'Test Owner', phone: '9999999999', isPrimary: true }],
      address: { state: 'Rajasthan', district: 'Jalore', area: 'Makrana' }
    });
    console.log(`Created Business: ${business.company_name} (${business._id})`);

    // Seed Products
    const product = await Product.create({
      vendorId: business._id, // Notice: usually vendorId maps to a Vendor or Business
      name: 'Premium Black Granite',
      category: 'Mining',
      status: 'active',
      priceRange: { min: 100, max: 150, unit: 'Sq.Ft' },
      specifications: [
        { key: 'Material', value: 'Granite' },
        { key: 'Finish', value: 'Polished' }
      ]
    });
    console.log(`Created Product: ${product.name} (${product._id})`);

    // Seed Mining Categories
    const miningCategory = await MiningCategory.create({
      name: 'Granite Mining',
      slug: 'granite-mining',
      status: 'active'
    });

    // Seed Banners
    await HomeBanner.create({
      title: 'Welcome to Stone Market',
      target_type: 'none',
      status: 'active'
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

seedDatabase();
