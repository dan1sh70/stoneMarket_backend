require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const Location = require('../models/Location');
const GraniteColor = require('../models/GraniteColor');
const Brand = require('../models/Brand');
const MainCategory = require('../models/MainCategory');
const MiningCategory = require('../models/MiningCategory');
const ManufacturerCategory = require('../models/ManufacturerCategory');
const ShowroomProductType = require('../models/ShowroomProductType');
const TraderCategory = require('../models/TraderCategory');
const ServiceCategory = require('../models/ServiceCategory');
const ShowroomReview = require('../models/ShowroomReview');
const HomeBanner = require('../models/HomeBanner');
const News = require('../models/News');
const Inquiry = require('../models/Inquiry');
const QuoteRequest = require('../models/QuoteRequest');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stone_market';

// Clean function to remove all mock data safely
const cleanMockData = async () => {
  console.log('--- Cleaning Up Mock Data ---');
  await Promise.all([
    User.deleteMany({ $or: [{ is_mock: true }, { mobile: { $regex: '^91111111' } }] }),
    Vendor.deleteMany({ $or: [{ is_mock: true }, { 'contact.mobile': { $regex: '^91111111' } }] }),
    BusinessProfile.deleteMany({ is_mock: true }),
    Product.deleteMany({ is_mock: true }),
    Location.deleteMany({ is_mock: true }),
    GraniteColor.deleteMany({ is_mock: true }),
    Brand.deleteMany({ is_mock: true }),
    MainCategory.deleteMany({ is_mock: true }),
    MiningCategory.deleteMany({ is_mock: true }),
    ManufacturerCategory.deleteMany({ is_mock: true }),
    ShowroomProductType.deleteMany({ is_mock: true }),
    TraderCategory.deleteMany({ is_mock: true }),
    ServiceCategory.deleteMany({ is_mock: true }),
    ShowroomReview.deleteMany({ is_mock: true }),
    HomeBanner.deleteMany({ is_mock: true }),
    News.deleteMany({ is_mock: true }),
    Inquiry.deleteMany({ is_mock: true }),
    QuoteRequest.deleteMany({ is_mock: true })
  ]);
  console.log('All mock data has been successfully deleted.');
};

const seedMockData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for mock data seeding.');

    if (process.argv.includes('--clean')) {
      await cleanMockData();
      await mongoose.disconnect();
      process.exit(0);
    }

    // Step 0: Clean existing mock records first so seeding is idempotent
    await cleanMockData();

    console.log('\n1. Seeding Locations...');
    const locationsData = [
      {
        name: 'Rajasthan',
        is_mock: true,
        districts: [
          { name: 'Kishangarh', areas: [{ name: 'Madanganj', pincode: '305801' }, { name: 'Marble Mandi', pincode: '305801' }, { name: 'Silora Industrial Area', pincode: '305802' }] },
          { name: 'Jalore', areas: [{ name: 'Phase 1 Industrial Area', pincode: '343001' }, { name: 'Phase 2 Industrial Area', pincode: '343001' }, { name: 'Bagra Quarry Hub', pincode: '343025' }] },
          { name: 'Rajsamand', areas: [{ name: 'Nathdwara', pincode: '313301' }, { name: 'Kelwa Mining Belt', pincode: '313334' }] },
          { name: 'Udaipur', areas: [{ name: 'Sukher', pincode: '313001' }, { name: 'Amberi', pincode: '313002' }, { name: 'Bhuwana', pincode: '313004' }] },
          { name: 'Jaipur', areas: [{ name: 'Mansarovar Industrial Area', pincode: '302020' }, { name: 'Sitapura', pincode: '302022' }, { name: 'Vishwakarma', pincode: '302013' }] },
          { name: 'Makrana', areas: [{ name: 'Gunawati Range', pincode: '341505' }, { name: 'Borawar', pincode: '341502' }] }
        ]
      },
      {
        name: 'Gujarat',
        is_mock: true,
        districts: [
          { name: 'Morbi', areas: [{ name: 'Ceramic City', pincode: '363641' }, { name: 'Halvad Road', pincode: '363642' }] },
          { name: 'Ahmedabad', areas: [{ name: 'Odhav GIDC', pincode: '382415' }, { name: 'Changodar', pincode: '382213' }] },
          { name: 'Surat', areas: [{ name: 'Sachin GIDC', pincode: '394230' }, { name: 'Pandesara', pincode: '394221' }] }
        ]
      },
      {
        name: 'Karnataka',
        is_mock: true,
        districts: [
          { name: 'Bengaluru', areas: [{ name: 'Jigani Industrial Area', pincode: '560105' }, { name: 'Bannerghatta Road', pincode: '560076' }, { name: 'Bommasandra', pincode: '560099' }] },
          { name: 'Ilkal', areas: [{ name: 'Ilkal Granite Market', pincode: '587125' }, { name: 'Kurgod Hub', pincode: '587126' }] }
        ]
      },
      {
        name: 'Andhra Pradesh',
        is_mock: true,
        districts: [
          { name: 'Ongole', areas: [{ name: 'Chimakurthy Galaxy Belt', pincode: '523226' }, { name: 'Pernamitta', pincode: '523225' }] },
          { name: 'Chittoor', areas: [{ name: 'Kuppam Granite Cluster', pincode: '517425' }, { name: 'Palamaner', pincode: '517408' }] }
        ]
      },
      {
        name: 'Telangana',
        is_mock: true,
        districts: [
          { name: 'Karimnagar', areas: [{ name: 'Tan Brown Mining Zone', pincode: '505001' }, { name: 'Manakondur', pincode: '505505' }] },
          { name: 'Hyderabad', areas: [{ name: 'Kukatpally', pincode: '500072' }, { name: 'Gachibowli', pincode: '500032' }] }
        ]
      }
    ];
    const createdLocations = await Location.insertMany(locationsData);
    console.log(`Created ${createdLocations.length} Locations.`);

    console.log('\n2. Seeding Granite Colors...');
    const colorsData = [
      { name: 'Black Galaxy', image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Absolute Black', image: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Steel Grey', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Tan Brown', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Kashmir White', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Colonial White', image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Imperial Red', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Lakha Red', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Alaska White', image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Crystal Yellow', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Hassan Green', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', is_mock: true },
      { name: 'Viscon White', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80', is_mock: true }
    ];
    const createdColors = await GraniteColor.insertMany(colorsData);
    console.log(`Created ${createdColors.length} Granite Colors.`);

    console.log('\n3. Seeding Brands...');
    const brandsData = [
      { name: 'RK Marble', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80', description: 'World leader in marble processing & quarries', website: 'https://www.rkmarble.com', is_mock: true },
      { name: 'Classic Marble Company', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80', description: 'Premier supplier of natural and engineered stones', website: 'https://www.classicmarble.com', is_mock: true },
      { name: 'A-Class Marble', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80', description: 'Exquisite collection of imported marble and granite', website: 'https://www.aclassmarble.co.in', is_mock: true },
      { name: 'Nitco Stones', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80', description: 'Pioneers in tiles, marble, and natural stone flooring', website: 'https://www.nitco.in', is_mock: true },
      { name: 'Asian Granito India', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80', description: 'Global brand for granite, quartz, and surfaces', website: 'https://www.aglasiangranito.com', is_mock: true },
      { name: 'Pokarna Engineered Stone', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80', description: 'India’s largest exporter of finished granite & quartz', website: 'https://www.pokarna.com', is_mock: true }
    ];
    const createdBrands = await Brand.insertMany(brandsData);
    console.log(`Created ${createdBrands.length} Brands.`);

    console.log('\n4. Seeding Categories...');
    // Main Categories
    const mainCategories = await MainCategory.insertMany([
      { name: 'Mining', slug: 'mining', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80', sort_order: 1, is_mock: true },
      { name: 'Manufacturer', slug: 'manufacturer', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', sort_order: 2, is_mock: true },
      { name: 'Showroom', slug: 'showroom', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', sort_order: 3, is_mock: true },
      { name: 'Trader', slug: 'trader', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80', sort_order: 4, is_mock: true },
      { name: 'Transport', slug: 'transport', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80', sort_order: 5, is_mock: true },
      { name: 'Machinery', slug: 'machinery', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80', sort_order: 6, is_mock: true }
    ]);

    // Mining Categories
    const miningCategories = await MiningCategory.insertMany([
      { name: 'Granite Mining', slug: 'granite-mining', description: 'Raw granite blocks direct from quarries', image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=400&q=80', sort_order: 1, is_mock: true },
      { name: 'Marble Mining', slug: 'marble-mining', description: 'Pure white & colored marble rough blocks', image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=400&q=80', sort_order: 2, is_mock: true },
      { name: 'Sandstone Mining', slug: 'sandstone-mining', description: 'Natural sandstone blocks and rough cuts', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80', sort_order: 3, is_mock: true },
      { name: 'Limestone Mining', slug: 'limestone-mining', description: 'High-density limestone for flooring and building', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', sort_order: 4, is_mock: true }
    ]);

    // Manufacturer Categories
    const mfgCategories = await ManufacturerCategory.insertMany([
      { name: 'Granite Slabs', slug: 'granite-slabs', description: 'Gangsaw & cutter size polished granite slabs', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', sort_order: 1, is_mock: true },
      { name: 'Marble Slabs', slug: 'marble-slabs', description: 'Italian and Indian processed marble slabs', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', sort_order: 2, is_mock: true },
      { name: 'Sandstone Tiles', slug: 'sandstone-tiles', description: 'Calibrated and honed natural sandstone tiles', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80', sort_order: 3, is_mock: true },
      { name: 'Quartz Surfaces', slug: 'quartz-surfaces', description: 'Engineered quartz slabs for kitchens and countertops', image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=400&q=80', sort_order: 4, is_mock: true },
      { name: 'CNC Stone Works', slug: 'cnc-stone-works', description: 'High precision 3D carving, jalis, and cladding', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80', sort_order: 5, is_mock: true },
      { name: 'Countertops & Steps', slug: 'countertops-and-steps', description: 'Custom cut-to-size steps, risers, and vanities', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', sort_order: 6, is_mock: true }
    ]);

    // Showroom Product Types
    const showroomTypes = await ShowroomProductType.insertMany([
      { name: 'Marble', slug: 'marble', description: 'Classic Makrana & Indian marble collections', image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=400&q=80', sort_order: 1, is_mock: true },
      { name: 'Italian Marble', slug: 'italian-marble', description: 'Statuario, Botticino, Carrara & exotic imports', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80', sort_order: 2, is_mock: true },
      { name: 'Granite', slug: 'granite', description: 'North & South Indian granite finishes', image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=400&q=80', sort_order: 3, is_mock: true },
      { name: 'Sandstone', slug: 'sandstone', description: 'Teakwood, Rainbow, and Dholpur sandstone', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80', sort_order: 4, is_mock: true },
      { name: 'Limestone', slug: 'limestone', description: 'Kota Stone and Tandur yellow/blue limestone', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', sort_order: 5, is_mock: true },
      { name: 'Quartz', slug: 'quartz', description: 'Premium engineered quartz slabs', image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=400&q=80', sort_order: 6, is_mock: true },
      { name: 'Onyx', slug: 'onyx', description: 'Translucent back-lit luxury onyx varieties', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80', sort_order: 7, is_mock: true },
      { name: 'Travertine', slug: 'travertine', description: 'Roman beige, walnut & silver travertine stones', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', sort_order: 8, is_mock: true }
    ]);

    // Trader Categories
    const traderCategories = await TraderCategory.insertMany([
      { name: 'Block Trader', slug: 'block-trader', description: 'Wholesale rough block suppliers', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80', sort_order: 1, is_mock: true },
      { name: 'Slab Trader', slug: 'slab-trader', description: 'Stockists of cut-to-size & gangsaw slabs', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', sort_order: 2, is_mock: true },
      { name: 'Tile Trader', slug: 'tile-trader', description: 'Wholesale distributors of stone & marble tiles', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80', sort_order: 3, is_mock: true },
      { name: 'Monument & Memorial', slug: 'monument-memorial', description: 'Headstones, gravestones, and memorial stone blocks', image: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=400&q=80', sort_order: 4, is_mock: true },
      { name: 'Landscape Stone', slug: 'landscape-stone', description: 'Cobbles, pebbles, pavers, and garden stepping stones', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80', sort_order: 5, is_mock: true },
      { name: 'Raw Material Supplier', slug: 'raw-material-supplier', description: 'Resin, abrasives, diamond segments, and quarry tools', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80', sort_order: 6, is_mock: true }
    ]);

    // Service Categories
    await ServiceCategory.insertMany([
      { name: 'Machine Repair & Maintenance', slug: 'machine-repair', description: 'On-site maintenance for gangsaw and multi-blade machines', is_mock: true, sort_order: 1 },
      { name: 'Stone Polishing Services', slug: 'stone-polishing', description: 'Diamond polishing, crystallization, and sealing', is_mock: true, sort_order: 2 },
      { name: 'CNC & Waterjet Cutting', slug: 'cnc-waterjet-cutting', description: 'Contract precision stone cutting and inlays', is_mock: true, sort_order: 3 },
      { name: 'Stone Transportation', slug: 'stone-transportation', description: 'Heavy trailer & open body logistics for stone blocks', is_mock: true, sort_order: 4 }
    ]);

    console.log('\n5. Seeding Banners and News...');
    await HomeBanner.insertMany([
      {
        title: "India's Premier Stone Marketplace",
        subtitle: 'Connect direct with 10,000+ verified quarries & factories',
        description: 'Source premium Granite, Marble, Quartz, and Sandstone without middlemen.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        mobile_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        button_text: 'Explore Quarries',
        target_type: 'category',
        sort_order: 1,
        status: 'active',
        is_mock: true
      },
      {
        title: 'Direct From Jalore & Kishangarh Factories',
        subtitle: 'Export grade slabs at factory prices',
        description: 'Certified export units with high-speed gangsaw & 16-head line polishers.',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        mobile_image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
        button_text: 'View Factories',
        target_type: 'category',
        sort_order: 2,
        status: 'active',
        is_mock: true
      },
      {
        title: 'Luxury Marble & Onyx Experience Centers',
        subtitle: 'Browse 3D virtual showroom tours',
        description: 'Explore live displays of Statuario, Botticino, and Brazilian exotic granite.',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        mobile_image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
        button_text: 'Find Showrooms',
        target_type: 'category',
        sort_order: 3,
        status: 'active',
        is_mock: true
      }
    ]);

    await News.insertMany([
      {
        title: 'Rajasthan Quarry Production Increases with Modern Machinery',
        summary: 'Jalore & Kishangarh granite hubs report 35% higher yield with automated wire saws.',
        content: 'Quarries across Rajasthan have adopted state-of-the-art wire saws and multi-axis processing lines, substantially minimizing wastage and boosting output for export orders.',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        type: 'market_update',
        isBreakingNews: false,
        publishedAt: new Date(),
        is_mock: true
      },
      {
        title: 'India International Stone Fair 2026 Announced',
        summary: 'Over 800 global exhibitors to showcase Italian marble, Indian granite, and CNC machinery.',
        content: 'The mega biennial event will gather mine owners, factory operators, architects, and international buyers under one roof.',
        imageUrl: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
        type: 'exhibition_alert',
        isBreakingNews: true,
        publishedAt: new Date(),
        is_mock: true
      }
    ]);

    console.log('\n6. Seeding Test Users & Business Profiles...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Users with roles
    const usersData = [
      { name: 'Admin Manager', mobile: '9111111101', email: 'admin@mockstonemarket.com', role: 'admin' },
      { name: 'Ramesh Patel (Mining 1)', mobile: '9111111102', email: 'ramesh.mining@mockstonemarket.com', role: 'mining' },
      { name: 'K. Venkatesh Rao (Mining 2)', mobile: '9111111103', email: 'venkatesh.mining@mockstonemarket.com', role: 'mining' },
      { name: 'Suresh Sharma (Mfg 1)', mobile: '9111111104', email: 'suresh.mfg@mockstonemarket.com', role: 'manufacturer' },
      { name: 'Rajesh Jain (Mfg 2)', mobile: '9111111105', email: 'rajesh.mfg@mockstonemarket.com', role: 'manufacturer' },
      { name: 'Bhavesh Patel (Mfg 3)', mobile: '9111111106', email: 'bhavesh.mfg@mockstonemarket.com', role: 'manufacturer' },
      { name: 'Vikram Singhania (Showroom 1)', mobile: '9111111107', email: 'vikram.showroom@mockstonemarket.com', role: 'showroom' },
      { name: 'Ankit Agarwal (Showroom 2)', mobile: '9111111108', email: 'ankit.showroom@mockstonemarket.com', role: 'showroom' },
      { name: 'Gautam Hegde (Showroom 3)', mobile: '9111111109', email: 'gautam.showroom@mockstonemarket.com', role: 'showroom' },
      { name: 'Manoj Gupta (Trader 1)', mobile: '9111111110', email: 'manoj.trader@mockstonemarket.com', role: 'trader' },
      { name: 'Devendra Singh (Trader 2)', mobile: '9111111111', email: 'devendra.trader@mockstonemarket.com', role: 'trader' },
      { name: 'Amit Kumar (Buyer 1)', mobile: '9111111112', email: 'buyer.amit@mockstonemarket.com', role: 'customer' },
      { name: 'Neha Verma (Buyer 2)', mobile: '9111111113', email: 'buyer.neha@mockstonemarket.com', role: 'customer' }
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create({
        name: u.name,
        mobile: u.mobile,
        email: u.email,
        password: passwordHash,
        role: u.role,
        status: 'active',
        is_mock: true
      });
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} test users (Password: password123, OTP: 123456).`);

    // Helper references
    const [uAdmin, uMining1, uMining2, uMfg1, uMfg2, uMfg3, uShow1, uShow2, uShow3, uTrade1, uTrade2, uBuyer1, uBuyer2] = createdUsers;
    const [cGalaxy, cAbsBlack, cSteelGrey, cTanBrown, cKashmirWhite, cColonialWhite, cImpRed, cLakhaRed, cAlaskaWhite, cYellow, cGreen, cViscon] = createdColors;
    const [bRK, bCMC, bAClass, bNitco, bAsian, bPokarna] = createdBrands;
    const [mfgSlabs, mfgMarble, mfgSandstone, mfgQuartz, mfgCNC, mfgCountertop] = mfgCategories;
    const [showMarble, showItalian, showGranite, showSandstone, showLime, showQuartz, showOnyx, showTravertine] = showroomTypes;
    const [trBlock, trSlab, trTile, trMonument, trLandscape, trRaw] = traderCategories;

    // Structured Working Hours Helper
    const standardHours = {
      monday: { is_open: true, open: '09:00', close: '20:00' },
      tuesday: { is_open: true, open: '09:00', close: '20:00' },
      wednesday: { is_open: true, open: '09:00', close: '20:00' },
      thursday: { is_open: true, open: '09:00', close: '20:00' },
      friday: { is_open: true, open: '09:00', close: '20:00' },
      saturday: { is_open: true, open: '09:00', close: '20:00' },
      sunday: { is_open: false, open: '10:00', close: '16:00' }
    };

    // 1. Business Profiles
    const businessesToCreate = [
      // Mining 1
      {
        userId: uMining1._id,
        business_type: 'mining',
        company_name: 'Aravalli Mining & Quarries Ltd.',
        gst_number: '08AAACA1234A1Z1',
        established_year: 2011,
        company_details: 'Leading direct mine operators with 3 active quarries producing high quality granite rough blocks.',
        ec_number: 'EC/RJ/MIN/2023/8892',
        monthly_capacity: 15000,
        capacity_unit: 'Tons',
        granite_colors: [cGalaxy._id, cAbsBlack._id, cSteelGrey._id],
        owners: [{ name: 'Ramesh Patel', phone: '9111111102', whatsapp: '9111111102', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' }],
        address: { state: 'Rajasthan', district: 'Jalore', area: 'Bagra Quarry Hub', full_address: 'Survey No. 42, Bagra Mining Belt, Jalore, Rajasthan 343025' },
        working_hours: standardHours,
        rating: 4.8,
        review_count: 14,
        status: 'active',
        is_mock: true
      },
      // Mining 2
      {
        userId: uMining2._id,
        business_type: 'mining',
        company_name: 'Deccan Black Galaxy Quarries',
        gst_number: '37AAACB5678B1Z2',
        established_year: 2008,
        company_details: 'Specialized in deep-vein Chimakurthy Black Galaxy rough blocks for international processing units.',
        ec_number: 'EC/AP/MIN/2022/4115',
        monthly_capacity: 22000,
        capacity_unit: 'Tons',
        granite_colors: [cGalaxy._id, cTanBrown._id],
        owners: [{ name: 'K. Venkatesh Rao', phone: '9111111103', whatsapp: '9111111103', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' }],
        address: { state: 'Andhra Pradesh', district: 'Ongole', area: 'Chimakurthy Galaxy Belt', full_address: 'Plot 18, Chimakurthy Galaxy Range, Ongole, Andhra Pradesh 523226' },
        working_hours: standardHours,
        rating: 4.9,
        review_count: 26,
        status: 'active',
        is_mock: true
      },

      // Manufacturer 1 (Export Factory in Jalore)
      {
        userId: uMfg1._id,
        business_type: 'manufacturer',
        company_name: 'Royal Rajasthan Granite Factory',
        gst_number: '08AAACR9988C1Z3',
        established_year: 2015,
        company_details: 'Export-oriented modern granite processing factory with gangsaw and multi-head line polishers.',
        manufacturer_category: mfgSlabs._id,
        iec_number: '0512034918',
        is_export_unit: true,
        export_countries: ['USA', 'UAE', 'United Kingdom', 'Germany', 'Australia'],
        granite_colors: [cAbsBlack._id, cSteelGrey._id, cLakhaRed._id, cAlaskaWhite._id],
        monthly_capacity: 250000,
        capacity_unit: 'Sq.Ft',
        machines: [
          { machine_name: 'Multi-Blade Gangsaw', quantity: 4 },
          { machine_name: '16-Head Line Polisher', quantity: 2 },
          { machine_name: 'Automated Bridge Cutter', quantity: 6 },
          { machine_name: 'Diamond Wire Saw', quantity: 2 }
        ],
        owners: [{ name: 'Suresh Sharma', phone: '9111111104', whatsapp: '9111111104', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' }],
        address: { state: 'Rajasthan', district: 'Jalore', area: 'Phase 1 Industrial Area', full_address: 'F-142, RIICO Industrial Area Phase 1, Jalore, Rajasthan 343001' },
        working_hours: standardHours,
        rating: 4.7,
        review_count: 32,
        status: 'active',
        is_mock: true
      },
      // Manufacturer 2 (Marble & CNC Works in Kishangarh)
      {
        userId: uMfg2._id,
        business_type: 'manufacturer',
        company_name: 'Kishangarh Marble & Stone Processors',
        gst_number: '08AAACK4455D1Z4',
        established_year: 2012,
        company_details: 'Leading Italian and Indian marble processing plant equipped with Breton line polishers and 5-axis CNC cutters.',
        manufacturer_category: mfgMarble._id,
        iec_number: '0516991201',
        is_export_unit: true,
        export_countries: ['Turkey', 'Italy', 'UAE', 'Saudi Arabia'],
        granite_colors: [cKashmirWhite._id, cColonialWhite._id, cViscon._id],
        monthly_capacity: 320000,
        capacity_unit: 'Sq.Ft',
        machines: [
          { machine_name: 'Italian Gangsaw Frame', quantity: 6 },
          { machine_name: 'Resin Vacuum Line', quantity: 1 },
          { machine_name: '5-Axis CNC Waterjet Cutter', quantity: 3 }
        ],
        owners: [{ name: 'Rajesh Jain', phone: '9111111105', whatsapp: '9111111105', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' }],
        address: { state: 'Rajasthan', district: 'Kishangarh', area: 'Silora Industrial Area', full_address: 'Plot 88-91, Silora Industrial Belt, Kishangarh, Rajasthan 305802' },
        working_hours: standardHours,
        rating: 4.9,
        review_count: 45,
        status: 'active',
        is_mock: true
      },
      // Manufacturer 3 (Morbi Quartz Factory)
      {
        userId: uMfg3._id,
        business_type: 'manufacturer',
        company_name: 'Morbi Precision Quartz & Surfaces',
        gst_number: '24AAACM1122E1Z5',
        established_year: 2019,
        company_details: 'High-density engineered quartz slab manufacturer with Italian vibro-compression technology.',
        manufacturer_category: mfgQuartz._id,
        iec_number: '0819283741',
        is_export_unit: false,
        monthly_capacity: 180000,
        capacity_unit: 'Sq.Ft',
        machines: [
          { machine_name: 'Automated Hydraulic Slab Press', quantity: 3 },
          { machine_name: 'Multi-Disc Calibrator', quantity: 2 }
        ],
        owners: [{ name: 'Bhavesh Patel', phone: '9111111106', whatsapp: '9111111106', photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80' }],
        address: { state: 'Gujarat', district: 'Morbi', area: 'Ceramic City', full_address: 'National Highway 8A, Trajpar, Morbi, Gujarat 363641' },
        working_hours: standardHours,
        rating: 4.6,
        review_count: 19,
        status: 'active',
        is_mock: true
      },

      // Showroom 1 (Luxury Showroom in Jaipur)
      {
        userId: uShow1._id,
        business_type: 'showroom',
        company_name: 'Grandeur Stone Studio & Galleria',
        gst_number: '08AAACG7788F1Z6',
        established_year: 2016,
        company_details: 'Luxury marble experience studio featuring full bookmatch slabs, exotic onyx, and designer stone installations.',
        display_area: 16000,
        premises_status: 'owned',
        virtual_tour_url: 'https://my.matterport.com/show/?m=mock-grandeur-studio',
        showroom_product_types: [showItalian._id, showMarble._id, showOnyx._id, showGranite._id],
        brands: [bRK._id, bCMC._id, bAClass._id],
        owners: [{ name: 'Vikram Singhania', phone: '9111111107', whatsapp: '9111111107', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' }],
        address: { state: 'Rajasthan', district: 'Jaipur', area: 'Mansarovar Industrial Area', full_address: 'B-12, Main RIICO Road, Mansarovar, Jaipur, Rajasthan 302020' },
        working_hours: standardHours,
        rating: 4.8,
        review_count: 28,
        status: 'active',
        is_mock: true
      },
      // Showroom 2 (Mega Gallery in Kishangarh)
      {
        userId: uShow2._id,
        business_type: 'showroom',
        company_name: 'Apex Marble Galleria & Imports',
        gst_number: '08AAACA3344G1Z7',
        established_year: 2010,
        company_details: 'Largest indoor stone showroom in Kishangarh displaying 300+ varieties of imported marble and quartz.',
        display_area: 28000,
        premises_status: 'owned',
        virtual_tour_url: 'https://my.matterport.com/show/?m=mock-apex-gallery',
        showroom_product_types: [showItalian._id, showTravertine._id, showQuartz._id, showGranite._id],
        brands: [bNitco._id, bPokarna._id, bAsian._id],
        owners: [{ name: 'Ankit Agarwal', phone: '9111111108', whatsapp: '9111111108', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }],
        address: { state: 'Rajasthan', district: 'Kishangarh', area: 'Marble Mandi', full_address: 'Opposite Stone Mandi Gate 2, Madanganj, Kishangarh, Rajasthan 305801' },
        working_hours: standardHours,
        rating: 4.9,
        review_count: 52,
        status: 'active',
        is_mock: true
      },
      // Showroom 3 (Bengaluru High-Tech Experience Center)
      {
        userId: uShow3._id,
        business_type: 'showroom',
        company_name: 'Silicon City Natural Stones & Studio',
        gst_number: '29AAACS6655H1Z8',
        established_year: 2018,
        company_details: 'Modern architectural stone experience gallery showcasing engineered quartz, granite, and sandstone tiles.',
        display_area: 14000,
        premises_status: 'rented',
        virtual_tour_url: 'https://my.matterport.com/show/?m=mock-silicon-studio',
        showroom_product_types: [showGranite._id, showQuartz._id, showSandstone._id],
        brands: [bAsian._id, bPokarna._id],
        owners: [{ name: 'Gautam Hegde', phone: '9111111109', whatsapp: '9111111109', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' }],
        address: { state: 'Karnataka', district: 'Bengaluru', area: 'Jigani Industrial Area', full_address: 'Plot 45, Phase II, Jigani Industrial Area, Bengaluru, Karnataka 560105' },
        working_hours: standardHours,
        rating: 4.7,
        review_count: 21,
        status: 'active',
        is_mock: true
      },

      // Trader 1 (Kishangarh Block & Slab Trader)
      {
        userId: uTrade1._id,
        business_type: 'trader',
        company_name: 'North India Stone Trading Co.',
        gst_number: '08AAACN5566I1Z9',
        established_year: 2013,
        company_details: 'Nationwide stockist & supplier of raw rough blocks, Gangsaw slabs, and container loads for domestic distributors.',
        trader_categories: [trBlock._id, trSlab._id, trRaw._id],
        trader_type: ['Wholesaler', 'Stockist', 'Exporter'],
        iec_number: '0518776219',
        owners: [
          { name: 'Manoj Gupta', designation: 'Managing Director', phone: '9111111110', whatsapp: '9111111110', email: 'manoj.trader@mockstonemarket.com', is_primary: true, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
          { name: 'Rahul Verma', designation: 'General Manager - Sales', phone: '9111111120', whatsapp: '9111111120', email: 'sales@mockstonemarket.com', is_primary: false, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' }
        ],
        address: { state: 'Rajasthan', district: 'Kishangarh', area: 'Madanganj', full_address: 'Shop 14-16, New Marble Market, Madanganj, Kishangarh, Rajasthan 305801' },
        working_hours: standardHours,
        rating: 4.8,
        review_count: 38,
        status: 'active',
        is_mock: true
      },
      // Trader 2 (Jaipur Monument & Landscape Stone Exporters)
      {
        userId: uTrade2._id,
        business_type: 'trader',
        company_name: 'Shekhawati Stone Exporters & Traders',
        gst_number: '08AAACS1199J1Z0',
        established_year: 2014,
        company_details: 'Suppliers of hand-carved stone monuments, landscape cobbles, sandstone tiles, and custom building elements.',
        trader_categories: [trSlab._id, trMonument._id, trLandscape._id],
        trader_type: ['Wholesaler', 'Exporter'],
        iec_number: '0519334812',
        owners: [
          { name: 'Devendra Singh', designation: 'Partner', phone: '9111111111', whatsapp: '9111111111', email: 'devendra.trader@mockstonemarket.com', is_primary: true, photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' }
        ],
        address: { state: 'Rajasthan', district: 'Jaipur', area: 'Sitapura', full_address: 'G-190, Export Promotion Industrial Park, Sitapura, Jaipur, Rajasthan 302022' },
        working_hours: standardHours,
        rating: 4.7,
        review_count: 29,
        status: 'active',
        is_mock: true
      }
    ];

    const createdBusinesses = await BusinessProfile.insertMany(businessesToCreate);
    console.log(`Created ${createdBusinesses.length} Business Profiles.`);

    // Also create matching Vendor models for backwards compatibility
    for (const b of createdBusinesses) {
      await Vendor.create({
        userId: b.userId,
        businessName: b.company_name,
        slug: b.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        category: b.business_type === 'mining' ? 'Mining' : b.business_type === 'manufacturer' ? 'Granite Manufacturer' : b.business_type === 'showroom' ? 'Showroom' : 'Traders & Suppliers',
        description: b.company_details,
        contact: {
          mobile: b.owners?.[0]?.phone,
          whatsapp: b.owners?.[0]?.whatsapp,
          email: b.owners?.[0]?.email
        },
        address: {
          line1: b.address.full_address,
          city: b.address.district,
          state: b.address.state,
          pincode: '302020'
        },
        gstVerified: true,
        documentsVerified: true,
        mobileVerified: true,
        status: 'active',
        is_mock: true
      });
    }
    console.log(`Synced ${createdBusinesses.length} Vendor profile records.`);

    console.log('\n7. Seeding Products for Each Business...');
    const productsToCreate = [];

    // Products for Mining 1 (Aravalli)
    productsToCreate.push(
      {
        vendorId: createdBusinesses[0]._id,
        name: 'Rough Black Galaxy Granite Block',
        description: 'First choice premium rough block with dense golden flecks, straight from the Aravalli quarry.',
        category: 'Mining',
        subcategory: 'Granite Blocks',
        graniteColors: ['Black Galaxy'],
        priceRange: { min: 25000, max: 45000, unit: 'Ton', visible: true },
        specifications: [
          { key: 'Color', value: 'Black Galaxy with Gold Specks' },
          { key: 'Block Volume', value: '2.5 to 4.2 CBM' },
          { key: 'Density', value: '2.95 g/cm3' },
          { key: 'Quarry Origin', value: 'Jalore, Rajasthan' }
        ],
        images: [
          'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[0]._id,
        name: 'Absolute Black Quarry Rough Block',
        description: 'Zero variation pitch-black gangsaw size block for high-end monuments and slabs.',
        category: 'Mining',
        subcategory: 'Granite Blocks',
        graniteColors: ['Absolute Black'],
        priceRange: { min: 30000, max: 55000, unit: 'Ton', visible: true },
        specifications: [
          { key: 'Color', value: 'Jet Black' },
          { key: 'Volume', value: '3.0 CBM Average' },
          { key: 'Compressive Strength', value: '220 MPa' }
        ],
        images: [
          'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: false,
        status: 'active',
        is_mock: true
      }
    );

    // Products for Manufacturer 1 (Royal Rajasthan)
    productsToCreate.push(
      {
        vendorId: createdBusinesses[2]._id,
        name: 'Export Quality Steel Grey Granite Slab',
        description: 'Mirror polished 18mm & 20mm Gangsaw slabs with epoxy resin backing and sharp edge calibration.',
        category: 'Manufacturer',
        subcategory: 'Granite Slabs',
        graniteColors: ['Steel Grey'],
        priceRange: { min: 95, max: 140, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Thickness', value: '18mm / 20mm' },
          { key: 'Finish', value: 'High Gloss Line Polished (90+ Glossometer)' },
          { key: 'Size', value: '280 x 160 cm up' },
          { key: 'Application', value: 'Kitchen Countertops, Flooring, Commercial Cladding' }
        ],
        images: [
          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[2]._id,
        name: 'Lakha Red Premium Granite Slab',
        description: 'Vibrant deep-red granite slabs ideal for exterior wall cladding and monumental staircases.',
        category: 'Manufacturer',
        subcategory: 'Granite Slabs',
        graniteColors: ['Lakha Red'],
        priceRange: { min: 145, max: 190, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Thickness', value: '20mm' },
          { key: 'Finish', value: 'Polished / Flamed available' },
          { key: 'Size', value: '250 x 140 cm up' }
        ],
        images: [
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: false,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[2]._id,
        name: 'Alaska White Exotic Granite Slab',
        description: 'Striking silver-white background with frost highlights and dark onyx veining.',
        category: 'Manufacturer',
        subcategory: 'Granite Slabs',
        graniteColors: ['Alaska White'],
        priceRange: { min: 180, max: 260, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Thickness', value: '20mm' },
          { key: 'Finish', value: 'Leather / Polish' },
          { key: 'Size', value: '300 x 180 cm Jumbo Gangsaw' }
        ],
        images: [
          'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      }
    );

    // Products for Manufacturer 2 (Kishangarh Marble)
    productsToCreate.push(
      {
        vendorId: createdBusinesses[3]._id,
        name: 'Pure White Makrana Dungri Marble Slab',
        description: 'Authentic high-calcium Makrana marble slab that retains permanent gloss and cool touch.',
        category: 'Manufacturer',
        subcategory: 'Marble Slabs',
        priceRange: { min: 220, max: 450, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Origin', value: 'Makrana, Rajasthan' },
          { key: 'Thickness', value: '16mm - 18mm' },
          { key: 'Calcium Content', value: '98%' },
          { key: 'Application', value: 'Temple Flooring, Villa Living Rooms' }
        ],
        images: [
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[3]._id,
        name: 'CNC 3D Carved Marble Wall Jali',
        description: 'Artisanal Mughal design geometric lattice wall partition carved with 5-axis CNC router.',
        category: 'Manufacturer',
        subcategory: 'CNC Stone Works',
        priceRange: { min: 650, max: 1200, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Thickness', value: '30mm / 40mm' },
          { key: 'Material', value: 'Makrana White Marble' },
          { key: 'Finish', value: 'Honed / Matte Hand Touch' }
        ],
        images: [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      }
    );

    // Products for Showroom 1 (Grandeur Stone Studio)
    productsToCreate.push(
      {
        vendorId: createdBusinesses[5]._id,
        name: 'Imported Statuario Extra Italian Marble',
        description: 'Pure alabaster white background with dramatic grey and gold feather veining. Perfect bookmatched pairs available.',
        category: 'Showroom',
        subcategory: 'Italian Marble',
        priceRange: { min: 650, max: 1800, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Brand', value: 'RK Marble' },
          { key: 'Origin', value: 'Carrara, Italy' },
          { key: 'Thickness', value: '18mm Italian Standard' },
          { key: 'Vein Matching', value: 'Bookmatch / Quadmatch available' }
        ],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[5]._id,
        name: 'Honey Gold Translucent Onyx Slab',
        description: 'Exquisite backlit luxury onyx slab creating dramatic warm ambience for bar counters and feature walls.',
        category: 'Showroom',
        subcategory: 'Onyx',
        priceRange: { min: 800, max: 2200, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Backlight Capability', value: '100% Translucent' },
          { key: 'Origin', value: 'Iran' },
          { key: 'Thickness', value: '16mm' }
        ],
        images: [
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      }
    );

    // Products for Showroom 2 (Apex Marble Galleria)
    productsToCreate.push(
      {
        vendorId: createdBusinesses[6]._id,
        name: 'Roman Beige Vein-Cut Travertine Slab',
        description: 'Authentic porous Italian travertine filled with transparent resin and honed for a warm Mediterranean appeal.',
        category: 'Showroom',
        subcategory: 'Travertine',
        priceRange: { min: 380, max: 620, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Brand', value: 'A-Class Marble' },
          { key: 'Cut Type', value: 'Vein Cut' },
          { key: 'Finish', value: 'Honed & Filled' },
          { key: 'Thickness', value: '18mm' }
        ],
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: false,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[6]._id,
        name: 'Calacatta Gold Engineered Quartz Slab',
        description: 'Non-porous stain and scratch resistant engineered quartz for luxury kitchen countertops.',
        category: 'Showroom',
        subcategory: 'Quartz',
        priceRange: { min: 280, max: 480, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Brand', value: 'Pokarna Engineered Stone' },
          { key: 'Thickness', value: '20mm' },
          { key: 'Slab Dimension', value: '3200 x 1600 mm (Jumbo)' },
          { key: 'Stain Resistance', value: '100% NSF Certified' }
        ],
        images: [
          'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      }
    );

    // Products for Trader 1 (North India Stone Trading)
    productsToCreate.push(
      {
        vendorId: createdBusinesses[8]._id,
        name: 'Wholesale Tan Brown Cut-to-Size Tiles',
        description: 'Standard 60x60 cm and 60x30 cm calibrated granite tiles ready for pallet shipping across India.',
        category: 'Trader',
        subcategory: 'Tile Trader',
        graniteColors: ['Tan Brown'],
        priceRange: { min: 65, max: 95, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Packing', value: 'Corrugated Wooden Crates' },
          { key: 'Size', value: '600 x 600 mm / 600 x 300 mm' },
          { key: 'Thickness', value: '18mm chamfered edges' }
        ],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[8]._id,
        name: 'Diamond Gangsaw Blade Segments (Raw Material)',
        description: 'High-cobalt diamond segments for stone cutting gangsaw frames and bridge saw blades.',
        category: 'Trader',
        subcategory: 'Raw Material Supplier',
        priceRange: { min: 45, max: 80, unit: 'Piece', visible: true },
        specifications: [
          { key: 'Diamond Grit Size', value: '40/50 Mesh' },
          { key: 'Bond Matrix', value: 'Cobalt-Bronze sintered' },
          { key: 'Application', value: 'Hard Granite cutting' }
        ],
        images: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: false,
        status: 'active',
        is_mock: true
      }
    );

    // Products for Trader 2 (Shekhawati Stone Exporters)
    productsToCreate.push(
      {
        vendorId: createdBusinesses[9]._id,
        name: 'Natural Hand-Cut Sandstone Cobbles & Pavers',
        description: 'Tumbled Autumn Brown and Grey sandstone cobbles for driveways, pathways, and landscaping projects.',
        category: 'Trader',
        subcategory: 'Landscape Stone',
        priceRange: { min: 45, max: 75, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Sizes', value: '10x10 cm, 14x14 cm, 14x20 cm' },
          { key: 'Thickness', value: '40mm - 60mm tumbled' },
          { key: 'Finish', value: 'Natural Riven' }
        ],
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
        ],
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      }
    );

    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`Created ${createdProducts.length} Products across businesses.`);

    console.log('\n8. Seeding Reviews for Showrooms...');
    const reviewsData = [
      {
        userId: uBuyer1._id,
        showroomId: createdBusinesses[5]._id, // Grandeur Studio
        rating: 5,
        review: 'Spectacular gallery! The Statuario marble collection is unmatched in Jaipur. The sales team patiently showed full bookmatch setups.',
        status: 'approved',
        is_mock: true
      },
      {
        userId: uBuyer2._id,
        showroomId: createdBusinesses[5]._id,
        rating: 5,
        review: 'Purchased backlit Honey Onyx for our reception counter. Outstanding quality and transparent pricing.',
        status: 'approved',
        is_mock: true
      },
      {
        userId: uBuyer1._id,
        showroomId: createdBusinesses[6]._id, // Apex Galleria
        rating: 5,
        review: 'Huge showroom in Kishangarh. The 3D virtual tour convinced us to visit in person. We finalized all travertine flooring here.',
        status: 'approved',
        is_mock: true
      },
      {
        userId: uBuyer2._id,
        showroomId: createdBusinesses[6]._id,
        rating: 4,
        review: 'Great variety of quartz countertops and imported marble. Quick assistance and prompt delivery scheduling.',
        status: 'approved',
        is_mock: true
      }
    ];
    const createdReviews = await ShowroomReview.insertMany(reviewsData);
    console.log(`Created ${createdReviews.length} Showroom Reviews.`);

    console.log('\n9. Seeding Inquiries and Quotes...');
    await Inquiry.insertMany([
      {
        senderId: uBuyer1._id,
        vendorId: createdBusinesses[2]._id, // Royal Rajasthan
        productId: createdProducts[2]._id,
        category: 'Manufacturer',
        subject: 'Requirement for 8,500 Sq.Ft Steel Grey Granite Slabs',
        message: 'Looking for 20mm line polished Steel Grey Gangsaw slabs for our residential tower in Ahmedabad. Please send FOB Mundra rates.',
        quantity: 8500,
        contactInfo: { name: 'Amit Kumar', mobile: '9111111112', email: 'buyer.amit@mockstonemarket.com' },
        status: 'new',
        is_mock: true
      },
      {
        senderId: uBuyer2._id,
        vendorId: createdBusinesses[8]._id, // North India Trader
        productId: createdProducts[9]._id,
        category: 'Trader',
        subject: 'Wholesale inquiry for 60x60 Tan Brown tiles',
        message: 'Need 3 container loads of calibrated Tan Brown tiles for retail stock in Pune. Please confirm availability and packing.',
        quantity: 15000,
        contactInfo: { name: 'Neha Verma', mobile: '9111111113', email: 'buyer.neha@mockstonemarket.com' },
        status: 'new',
        is_mock: true
      }
    ]);

    await QuoteRequest.insertMany([
      {
        userId: uBuyer1._id,
        businessId: createdBusinesses[5]._id, // Grandeur Studio
        productId: createdProducts[6]._id, // Statuario Extra
        quantity: 1200,
        unit: 'Sq.Ft',
        message: 'Please provide quotation for bookmatched Statuario lot #402 including delivery to Civil Lines, Jaipur.',
        status: 'pending',
        is_mock: true
      }
    ]);
    console.log('Created sample Inquiries and Quote Requests.');

    console.log('\n======================================================');
    console.log('>>> MOCK DATA SEEDING COMPLETED SUCCESSFULLY! <<<');
    console.log('======================================================');
    console.log('Test Accounts Available (All Password: password123 | OTP: 123456):');
    console.log('  - Admin:        Mobile 9111111101 (Admin Manager)');
    console.log('  - Mining 1:     Mobile 9111111102 (Aravalli Mining, Jalore)');
    console.log('  - Mining 2:     Mobile 9111111103 (Deccan Galaxy, Ongole)');
    console.log('  - Mfg 1:        Mobile 9111111104 (Royal Rajasthan Granite, Jalore)');
    console.log('  - Mfg 2:        Mobile 9111111105 (Kishangarh Marble & Processors)');
    console.log('  - Mfg 3:        Mobile 9111111106 (Morbi Precision Quartz)');
    console.log('  - Showroom 1:   Mobile 9111111107 (Grandeur Stone Studio, Jaipur)');
    console.log('  - Showroom 2:   Mobile 9111111108 (Apex Marble Galleria, Kishangarh)');
    console.log('  - Showroom 3:   Mobile 9111111109 (Silicon City Stones, Bengaluru)');
    console.log('  - Trader 1:     Mobile 9111111110 (North India Stone Trading, Kishangarh)');
    console.log('  - Trader 2:     Mobile 9111111111 (Shekhawati Stone Exporters, Jaipur)');
    console.log('  - Buyer 1:      Mobile 9111111112 (Amit Kumar)');
    console.log('  - Buyer 2:      Mobile 9111111113 (Neha Verma)');
    console.log('------------------------------------------------------');
    console.log('All mock records tagged with { is_mock: true } for clean deletion.');
    console.log('Run `npm run clean:mock` anytime when testing finishes.');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Mock seeding failed:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedMockData();
}

module.exports = { seedMockData, cleanMockData };
