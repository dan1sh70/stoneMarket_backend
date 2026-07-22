const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');

// Load environment variables from the root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/stonemarket_test';
    
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);

    // Clear existing collections
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Vendor.deleteMany();
    await Product.deleteMany();
    console.log('Existing data cleared.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Seed Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      mobile: '9999999999',
      email: 'admin@stonemarket.com',
      password: passwordHash,
      role: 'admin',
      status: 'active',
      mobileVerified: true
    });
    console.log('Admin user created: admin@stonemarket.com / password123 (or mobile 9999999999)');

    // Seed Buyers
    const buyers = [];
    for (let i = 1; i <= 5; i++) {
      buyers.push({
        name: `Buyer ${i}`,
        mobile: `888888888${i}`,
        email: `buyer${i}@example.com`,
        password: passwordHash,
        role: 'buyer',
        status: 'active'
      });
    }
    const createdBuyers = await User.insertMany(buyers);
    console.log(`Created ${createdBuyers.length} buyers.`);

    // Seed Vendors
    const vendorUsers = [];
    for (let i = 1; i <= 5; i++) {
      vendorUsers.push({
        name: `Vendor User ${i}`,
        mobile: `777777777${i}`,
        email: `vendor${i}@example.com`,
        password: passwordHash,
        role: 'vendor',
        status: 'active'
      });
    }
    const createdVendorUsers = await User.insertMany(vendorUsers);

    const vendors = [];
    const categories = ['Mining', 'Granite Manufacturer', 'Traders & Suppliers', 'Transporters', 'Machinery'];
    for (let i = 0; i < 5; i++) {
      vendors.push({
        userId: createdVendorUsers[i]._id,
        businessName: `Dummy Vendor Business ${i + 1}`,
        slug: `dummy-vendor-business-${i + 1}`,
        category: categories[i],
        description: `This is a dummy vendor description for business ${i + 1}.`,
        gstVerified: true,
        documentsVerified: true,
        mobileVerified: true,
        status: 'active'
      });
    }
    const createdVendors = await Vendor.insertMany(vendors);
    console.log(`Created ${createdVendors.length} vendors.`);

    // Seed Products
    const products = [];
    for (let i = 0; i < createdVendors.length; i++) {
      for (let j = 1; j <= 3; j++) {
        products.push({
          vendorId: createdVendors[i]._id,
          name: `Dummy Product ${j} of Vendor ${i + 1}`,
          description: `Dummy product description ${j}`,
          category: createdVendors[i].category,
          priceRange: { min: 100 * j, max: 200 * j, unit: 'sqft', visible: true },
          status: 'active'
        });
      }
    }
    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products.`);

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
