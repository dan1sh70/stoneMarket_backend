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
const BuyerType = require('../models/BuyerType');
const BuyerRequirement = require('../models/BuyerRequirement');
const BuyerReview = require('../models/BuyerReview');
const QuoteResponse = require('../models/QuoteResponse');
const BusinessFavorite = require('../models/BusinessFavorite');
const VehicleType = require('../models/VehicleType');
const TransportVehicle = require('../models/TransportVehicle');
const TransportRoute = require('../models/TransportRoute');
const FreightRate = require('../models/FreightRate');
const Estimate = require('../models/Estimate');
const EstimateAuditLog = require('../models/EstimateAuditLog');
const MeasurementUnit = require('../models/MeasurementUnit');
const CustomerAddress = require('../models/CustomerAddress');
const CustomerFavorite = require('../models/CustomerFavorite');
const CustomerNotification = require('../models/CustomerNotification');
const UserSession = require('../models/UserSession');
const SupportTicket = require('../models/SupportTicket');
const SupportFaq = require('../models/SupportFaq');
const AppConfig = require('../models/AppConfig');

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
    QuoteRequest.deleteMany({ is_mock: true }),
    BuyerType.deleteMany({ is_mock: true }),
    BuyerRequirement.deleteMany({ is_mock: true }),
    BuyerReview.deleteMany({ is_mock: true }),
    QuoteResponse.deleteMany({ is_mock: true }),
    BusinessFavorite.deleteMany({ is_mock: true }),
    VehicleType.deleteMany({ is_mock: true }),
    TransportVehicle.deleteMany({ is_mock: true }),
    TransportRoute.deleteMany({ is_mock: true }),
    FreightRate.deleteMany({ is_mock: true }),
    Estimate.deleteMany({ is_mock: true }),
    EstimateAuditLog.deleteMany({}),
    MeasurementUnit.deleteMany({ is_mock: true }),
    CustomerAddress.deleteMany({ is_mock: true }),
    CustomerFavorite.deleteMany({ is_mock: true }),
    CustomerNotification.deleteMany({ is_mock: true }),
    UserSession.deleteMany({ is_mock: true }),
    SupportTicket.deleteMany({ is_mock: true }),
    SupportFaq.deleteMany({ is_mock: true }),
    AppConfig.deleteMany({ is_mock: true })
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

    // Buyer Types
    console.log('\n4b. Seeding Buyer Types...');
    const buyerTypesData = [
      { name: 'Construction Company', slug: 'construction-company', description: 'Infrastructure, commercial & residential developers', icon: 'building', sort_order: 1, status: 'active', is_mock: true },
      { name: 'Builder / Developer', slug: 'builder-developer', description: 'Real estate residential township builders', icon: 'home', sort_order: 2, status: 'active', is_mock: true },
      { name: 'Architect / Interior Designer', slug: 'architect-interior-designer', description: 'Architecture studios and luxury interior planners', icon: 'compass', sort_order: 3, status: 'active', is_mock: true },
      { name: 'Stone Wholesaler', slug: 'stone-wholesaler', description: 'Regional stockists & bulk stone buyers', icon: 'truck', sort_order: 4, status: 'active', is_mock: true },
      { name: 'Stone Retailer', slug: 'stone-retailer', description: 'Local stone showroom & retail counter operators', icon: 'shopping-bag', sort_order: 5, status: 'active', is_mock: true },
      { name: 'Importer', slug: 'importer', description: 'International stone and block procurement companies', icon: 'globe', sort_order: 6, status: 'active', is_mock: true },
      { name: 'Exporter', slug: 'exporter', description: 'Stone merchant exporters looking for domestic factory sourcing', icon: 'ship', sort_order: 7, status: 'active', is_mock: true },
      { name: 'Project Contractor', slug: 'project-contractor', description: 'Government and turnkey civil contractors', icon: 'briefcase', sort_order: 8, status: 'active', is_mock: true },
      { name: 'Hotel / Hospitality Business', slug: 'hotel-hospitality-business', description: 'Hotels, resorts, and premium hospitality chains', icon: 'coffee', sort_order: 9, status: 'active', is_mock: true },
      { name: 'Fabricator', slug: 'fabricator', description: 'Countertop and stone cut-to-size workshops', icon: 'tool', sort_order: 10, status: 'active', is_mock: true },
      { name: 'Distributor', slug: 'distributor', description: 'Exclusive territory distribution partners', icon: 'share-2', sort_order: 11, status: 'active', is_mock: true },
      { name: 'Individual Buyer', slug: 'individual-buyer', description: 'Homeowners building private villas and residences', icon: 'user', sort_order: 12, status: 'active', is_mock: true },
      { name: 'Other', slug: 'other', description: 'Institutional and specialized stone purchasers', icon: 'more-horizontal', sort_order: 13, status: 'active', is_mock: true }
    ];
    const createdBuyerTypes = await BuyerType.insertMany(buyerTypesData);
    console.log(`Created ${createdBuyerTypes.length} Buyer Types.`);

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
      { name: 'Amit Kumar (Buyer 1 - Infra)', mobile: '9111111112', email: 'buyer.amit@mockstonemarket.com', role: 'buyer' },
      { name: 'Neha Verma (Buyer 2 - Hospitality)', mobile: '9111111113', email: 'buyer.neha@mockstonemarket.com', role: 'buyer' },
      { name: 'Rohan Mehta (Buyer 3 - Architect)', mobile: '9111111114', email: 'buyer.rohan@mockstonemarket.com', role: 'buyer' },
      { name: 'Sunil Agarwal (Buyer 4 - Distributor)', mobile: '9111111115', email: 'buyer.sunil@mockstonemarket.com', role: 'buyer' }
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
    const [
      uAdmin, uMining1, uMining2, uMfg1, uMfg2, uMfg3,
      uShow1, uShow2, uShow3, uTrade1, uTrade2,
      uBuyer1, uBuyer2, uBuyer3, uBuyer4
    ] = createdUsers;
    const [
      btConst, btBuilder, btArchitect, btWholesaler, btRetailer,
      btImporter, btExporter, btContractor, btHotel, btFabricator,
      btDistributor, btIndividual, btOther
    ] = createdBuyerTypes;
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
      },

      // Buyer 1: Global Infra Buildcon (Construction Company - Jaipur)
      {
        userId: uBuyer1._id,
        business_type: 'buyer',
        company_name: 'Global Infra Buildcon Pvt Ltd',
        gst_number: '08AAACG1122K1Z5',
        established_year: 2012,
        company_details: 'Leading residential high-rise and commercial infrastructure developer in North & Western India. Procuring over 200,000 sqft granite and marble annually.',
        buyer_types: [btConst._id, btBuilder._id],
        preferred_materials: ['Granite', 'Sandstone', 'Limestone'],
        preferred_products: ['Slabs', 'Tiles', 'Cobbles'],
        requirement_summary: 'Bulk Slabs & Rough Blocks for Commercial Projects',
        industry: 'Infrastructure & Commercial Real Estate',
        website: 'https://globalinfrabuildcon.mock',
        preferred_communication: 'phone',
        verification_status: 'approved',
        is_verified: true,
        verified_at: new Date(),
        rating: 4.9,
        review_count: 25,
        address: { state: 'Rajasthan', district: 'Jaipur', area: 'Mansarovar', full_address: 'Plot 101-105, Corporate Tower, Mansarovar, Jaipur, Rajasthan 302020' },
        status: 'active',
        is_mock: true
      },

      // Buyer 2: Heritage Palace & Hospitality Group (Udaipur)
      {
        userId: uBuyer2._id,
        business_type: 'buyer',
        company_name: 'Heritage Palace & Hospitality Group',
        gst_number: '08AAACH4455L1Z8',
        established_year: 2015,
        company_details: 'Luxury 5-star heritage hotel and resort chain expanding across Rajasthan and Goa. High demand for bookmatch Italian marble and exotic quartz.',
        buyer_types: [btHotel._id, btArchitect._id],
        preferred_materials: ['Italian Marble', 'Onyx', 'Quartz'],
        preferred_products: ['Bookmatch Slabs', 'Countertops', 'Custom Inlays'],
        requirement_summary: 'Premium Bookmatched Italian Marble & Onyx',
        industry: 'Hospitality & Luxury Resorts',
        website: 'https://heritagepalaceresorts.mock',
        preferred_communication: 'whatsapp',
        verification_status: 'approved',
        is_verified: true,
        verified_at: new Date(),
        rating: 4.8,
        review_count: 14,
        address: { state: 'Rajasthan', district: 'Udaipur', area: 'Fateh Sagar', full_address: 'Heritage Lake Palace, Fateh Sagar Road, Udaipur, Rajasthan 313001' },
        status: 'active',
        is_mock: true
      },

      // Buyer 3: Mehta Design & Architecture Studio (Ahmedabad)
      {
        userId: uBuyer3._id,
        business_type: 'buyer',
        company_name: 'Mehta Design & Architecture Studio',
        gst_number: '24AAACM7788P1Z3',
        established_year: 2018,
        company_details: 'Award-winning architectural studio specializing in luxury private villas, boutique corporate offices, and landscape stone architecture.',
        buyer_types: [btArchitect._id],
        preferred_materials: ['Sandstone', 'Granite', 'Travertine'],
        preferred_products: ['Cladding Tiles', 'Jali & CNC Carvings', 'Floor Slabs'],
        requirement_summary: 'Handcrafted Sandstone & Natural Travertine Slabs',
        industry: 'Architecture & Interior Planning',
        website: 'https://mehtadesignstudio.mock',
        preferred_communication: 'email',
        verification_status: 'approved',
        is_verified: true,
        verified_at: new Date(),
        rating: 4.7,
        review_count: 9,
        address: { state: 'Gujarat', district: 'Ahmedabad', area: 'SG Highway', full_address: 'Studio 402, Signature One, SG Highway, Ahmedabad, Gujarat 380054' },
        status: 'active',
        is_mock: true
      },

      // Buyer 4: Shree Ram Stone Distributors (Kishangarh - Pending Verification)
      {
        userId: uBuyer4._id,
        business_type: 'buyer',
        company_name: 'Shree Ram Stone Distributors',
        gst_number: '08AAACS9900M1Z2',
        established_year: 2021,
        company_details: 'Emerging regional stone and tile distributor catering to local contractors and residential builders across central Rajasthan.',
        buyer_types: [btDistributor._id, btRetailer._id],
        preferred_materials: ['Granite', 'Marble'],
        preferred_products: ['Cut-to-size Tiles', 'Steps & Risers'],
        requirement_summary: 'Granite Tiles and Countertop Blanks',
        industry: 'Building Materials Distribution',
        preferred_communication: 'phone',
        verification_status: 'pending',
        is_verified: false,
        rating: 4.2,
        review_count: 3,
        address: { state: 'Rajasthan', district: 'Kishangarh', area: 'Madanganj', full_address: 'Godown 8, Stone Hub, Madanganj, Kishangarh, Rajasthan 305801' },
        status: 'active',
        is_mock: true
      }
    ];

    const createdBusinesses = await BusinessProfile.insertMany(businessesToCreate);
    console.log(`Created ${createdBusinesses.length} Business Profiles.`);

    // Also create matching Vendor models for backwards compatibility
    for (const b of createdBusinesses) {
      if (b.business_type === 'buyer') continue;
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

    console.log('\n10. Seeding Buyer Purchasing Requirements...');
    const [bReq1, bReq2, bReq3, bReq4] = await BuyerRequirement.insertMany([
      {
        buyerId: createdBusinesses[10]._id, // Global Infra
        userId: uBuyer1._id,
        title: 'Bulk 20mm Steel Grey Granite Gangsaw Slabs',
        description: 'Need export quality 20mm line polished Steel Grey Gangsaw slabs for our 30-acre commercial IT park in Jaipur.',
        material: 'Granite',
        product_type: 'Slabs',
        stone_type: 'Granite',
        colour: 'Steel Grey',
        finish: 'Polished',
        grade: 'First Quality Export',
        required_size: 'Gangsaw (300cm x 180cm+)',
        thickness_mm: 20,
        quantity: 25000,
        quantity_unit: 'sqft',
        budget: { min: 65, max: 80, currency: 'INR' },
        delivery_location: {
          city: 'Jaipur',
          state: 'Rajasthan',
          area: 'Mansarovar',
          full_address: 'Site Office, IT Park Phase 3, Mansarovar, Jaipur'
        },
        required_delivery_date: new Date(Date.now() + 30 * 86400000),
        order_frequency: 'monthly',
        status: 'open',
        visibility: 'public',
        is_mock: true
      },
      {
        buyerId: createdBusinesses[11]._id, // Heritage Palace
        userId: uBuyer2._id,
        title: 'Statuario & Botticino Bookmatch Marble for Presidential Suites',
        description: 'Requirement for ultra-luxury flawless white marble slabs with continuous grey veining for 5-star resort suites flooring.',
        material: 'Italian Marble',
        product_type: 'Slabs',
        stone_type: 'Marble',
        colour: 'White / Cream',
        finish: 'Mirror Polished',
        grade: 'Premium Select',
        required_size: 'Jumbo Slabs',
        thickness_mm: 18,
        quantity: 4500,
        quantity_unit: 'sqft',
        budget: { min: 450, max: 700, currency: 'INR' },
        delivery_location: {
          city: 'Udaipur',
          state: 'Rajasthan',
          area: 'Fateh Sagar',
          full_address: 'Heritage Lake Palace Resort, Fateh Sagar Lake, Udaipur'
        },
        required_delivery_date: new Date(Date.now() + 45 * 86400000),
        order_frequency: 'one_time',
        status: 'open',
        visibility: 'public',
        is_mock: true
      },
      {
        buyerId: createdBusinesses[12]._id, // Mehta Design
        userId: uBuyer3._id,
        title: 'Dholpur Beige Sandstone Wall Cladding Tiles',
        description: 'Hand-chiseled and shot-blasted natural beige sandstone panels for luxury private villa facades in Ahmedabad.',
        material: 'Sandstone',
        product_type: 'Tiles',
        stone_type: 'Sandstone',
        colour: 'Beige',
        finish: 'Shot Blasted',
        grade: 'Uniform Grade',
        required_size: '600mm x 300mm',
        thickness_mm: 25,
        quantity: 8000,
        quantity_unit: 'sqft',
        budget: { min: 40, max: 55, currency: 'INR' },
        delivery_location: {
          city: 'Ahmedabad',
          state: 'Gujarat',
          area: 'SG Highway',
          full_address: 'Villa 14, Sky Sanctuary, SG Highway, Ahmedabad'
        },
        required_delivery_date: new Date(Date.now() + 20 * 86400000),
        order_frequency: 'one_time',
        status: 'open',
        visibility: 'public',
        is_mock: true
      },
      {
        buyerId: createdBusinesses[13]._id, // Shree Ram Distributors
        userId: uBuyer4._id,
        title: 'Calibrated Granite Steps & Risers',
        description: 'Standard 30mm bullnosed steps and 20mm polished risers in Tan Brown and Lakha Red for central Rajasthan distribution.',
        material: 'Granite',
        product_type: 'Cut-to-size',
        stone_type: 'Granite',
        colour: 'Tan Brown / Lakha Red',
        finish: 'One Long Edge Bullnosed & Polished',
        grade: 'Standard Commercial',
        required_size: '4ft x 1ft Steps, 4ft x 8in Risers',
        thickness_mm: 30,
        quantity: 6000,
        quantity_unit: 'sqft',
        budget: { min: 70, max: 95, currency: 'INR' },
        delivery_location: {
          city: 'Kishangarh',
          state: 'Rajasthan',
          area: 'Madanganj',
          full_address: 'Godown 8, Stone Hub, Madanganj, Kishangarh'
        },
        required_delivery_date: new Date(Date.now() + 15 * 86400000),
        order_frequency: 'quarterly',
        status: 'open',
        visibility: 'public',
        is_mock: true
      }
    ]);
    console.log('Created 4 Buyer Purchasing Requirements.');

    console.log('\n11. Seeding Buyer Reviews...');
    await BuyerReview.insertMany([
      {
        userId: uMfg1._id,
        buyerId: createdBusinesses[10]._id, // Global Infra
        rating: 5,
        review: 'Exceptional buyer! Regular high-volume requirements, crystal clear technical specs, and instant payments upon dispatch confirmation.',
        status: 'approved',
        is_mock: true
      },
      {
        userId: uTrade1._id,
        buyerId: createdBusinesses[10]._id, // Global Infra
        rating: 5,
        review: 'Smooth offloading at their Jaipur site. Transparent inspection team and courteous site engineers. A pleasure to do business with.',
        status: 'approved',
        is_mock: true
      },
      {
        userId: uShow1._id,
        buyerId: createdBusinesses[11]._id, // Heritage Palace
        rating: 5,
        review: 'High-end hospitality client with great taste for premium bookmatched Italian marble. Immediate RTGS payment upon billing.',
        status: 'approved',
        is_mock: true
      }
    ]);
    console.log('Created 3 Buyer Reviews.');

    console.log('\n12. Seeding Sample Quotes & Responses...');
    const sampleQuote = await QuoteRequest.create({
      userId: uBuyer1._id,
      businessId: createdBusinesses[2]._id, // Royal Rajasthan Granite (Mfg 1)
      buyerProfileId: createdBusinesses[10]._id,
      requirementId: bReq1._id,
      buyerContact: {
        name: 'Amit Kumar',
        phone: '9111111112',
        email: 'buyer.amit@mockstonemarket.com',
        city: 'Jaipur'
      },
      quantity: 10000,
      unit: 'sqft',
      size: 'Gangsaw (300cm x 180cm)',
      thickness: '20mm',
      finish: 'Line Polished',
      grade: 'Export Grade 1',
      delivery_location: 'Mansarovar, Jaipur',
      required_delivery_date: new Date(Date.now() + 25 * 86400000),
      additional_specifications: 'Need uniform grey grain with zero pinholes or cracks. Calibrated thickness required.',
      message: 'Looking for 10,000 sqft Steel Grey Gangsaw slabs for delivery to Mansarovar, Jaipur.',
      status: 'responded',
      is_mock: true
    });

    await QuoteResponse.create({
      quoteRequestId: sampleQuote._id,
      supplierId: createdBusinesses[2]._id,
      supplierUserId: uMfg1._id,
      offered_price: 72,
      currency: 'INR',
      unit: 'sqft',
      available_quantity: 15000,
      taxes: 18,
      shipping_cost: 0,
      estimated_delivery_time: '7-10 days',
      offer_validity: new Date(Date.now() + 15 * 86400000),
      terms_and_conditions: '30% advance on PO confirmation, balance against loading pictures before gate pass. GST extra as applicable.',
      status: 'submitted',
      is_mock: true
    });
    console.log('Created sample Quotation and Supplier Quote Response.');

    console.log('\n13. Seeding Transport Module Data...');
    // A. Vehicle Types
    const vTypes = await VehicleType.insertMany([
      {
        name: '10-Wheeler Heavy Truck',
        slug: '10-wheeler-truck',
        configuration: '10-Wheeler Rigid Open Body / High Side',
        default_payload_capacity: 16,
        capacity_unit: 'ton',
        description: 'Ideal for local and regional block & gangsaw slab transport up to 16 tons.',
        is_active: true,
        is_mock: true
      },
      {
        name: '12-Wheeler Heavy Truck',
        slug: '12-wheeler-truck',
        configuration: '12-Wheeler Heavy Multi-Axle',
        default_payload_capacity: 25,
        capacity_unit: 'ton',
        description: 'High capacity long-haul truck suited for granite & marble transport up to 25 tons.',
        is_active: true,
        is_mock: true
      },
      {
        name: 'Multi-Axle Flatbed Trailer',
        slug: 'multi-axle-trailer',
        configuration: 'Semi-Trailer Flatbed 40ft',
        default_payload_capacity: 40,
        capacity_unit: 'ton',
        description: 'Heavy duty flatbed trailer for raw mining blocks and export container loading up to 40 tons.',
        is_active: true,
        is_mock: true
      },
      {
        name: 'Heavy Dump Truck (Tipper)',
        slug: 'heavy-dump-truck',
        configuration: 'Heavy Duty 6x4 Tipper',
        default_payload_capacity: 18,
        capacity_unit: 'ton',
        description: 'Mining overburden, raw crushed stone, ballast, and cobble boulder transport.',
        is_active: true,
        is_mock: true
      }
    ]);
    console.log(`Created ${vTypes.length} Transport Vehicle Types.`);

    // B. Transport Users
    const uTransNational = await User.create({
      name: 'Rajesh Gurjar (Trans National)',
      mobile: '9111111116',
      email: 'national.transport@mockstonemarket.com',
      password: passwordHash,
      role: 'transport_national',
      status: 'active',
      is_mock: true
    });

    const uTransLocal = await User.create({
      name: 'Mahesh Choudhary (Trans Local)',
      mobile: '9111111117',
      email: 'local.transport@mockstonemarket.com',
      password: passwordHash,
      role: 'transport_local',
      status: 'active',
      is_mock: true
    });

    // C. Transport Provider Business Profiles
    const bTransNational = await BusinessProfile.create({
      userId: uTransNational._id,
      company_name: 'Apex Bharat Heavy Logistics',
      business_type: 'transport_national',
      transport_category: 'national',
      company_details: 'Premier All-India stone transportation specialist with dedicated fleet of 10-wheelers, 12-wheelers and multi-axle trailers. Serving Kishangarh, Jalore, Makrana to all Indian ports and major metropolitan hubs.',
      established_year: 2011,
      address: {
        state: 'Rajasthan',
        district: 'Kishangarh',
        area: 'Marble Mandi',
        full_address: 'Plot 45, Transport Nagar, Marble Mandi, Kishangarh, Rajasthan - 305801',
        latitude: 26.5744,
        longitude: 74.8655
      },
      owners: [
        {
          name: 'Rajesh Gurjar',
          designation: 'Managing Director',
          phone: '9111111116',
          whatsapp: '9111111116',
          is_primary: true
        },
        {
          name: 'Vikram Singh',
          designation: 'Fleet Operations Manager',
          phone: '9111111120',
          whatsapp: '9111111120',
          is_primary: false
        }
      ],
      gst_number: '08AAAAA0000A1Z5',
      is_verified: true,
      verification_status: 'approved',
      status: 'active',
      working_hours: standardHours,
      has_all_india_permit: true,
      has_national_coverage: true,
      fleet_summary: '45+ Trucks including 10-wheelers, 12-wheelers, and hydraulic heavy trailers',
      supported_vehicle_types: [vTypes[0]._id, vTypes[1]._id, vTypes[2]._id],
      operational_states: ['Rajasthan', 'Gujarat', 'Maharashtra', 'Delhi', 'Karnataka'],
      operational_cities: ['Kishangarh', 'Jalore', 'Jaipur', 'Ahmedabad', 'Mumbai', 'Delhi'],
      rating: 4.8,
      review_count: 29,
      cover_images: [
        'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80'
      ],
      is_mock: true
    });

    const bTransLocal = await BusinessProfile.create({
      userId: uTransLocal._id,
      company_name: 'Jaipur City Stone Express',
      business_type: 'transport_local',
      transport_category: 'local',
      company_details: 'Reliable intra-city and nearby quarry stone hauling service. Prompt dispatch within Jaipur, Sitapura, Mansarovar and Bagru industrial zones.',
      established_year: 2018,
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        area: 'Mansarovar Industrial Area',
        full_address: '12, New Aatish Market, Mansarovar, Jaipur, Rajasthan - 302020',
        latitude: 26.8522,
        longitude: 75.7683
      },
      owners: [
        {
          name: 'Mahesh Choudhary',
          designation: 'Owner & Fleet Lead',
          phone: '9111111117',
          whatsapp: '9111111117',
          is_primary: true
        }
      ],
      gst_number: '08BBBBB1111B1Z9',
      is_verified: true,
      verification_status: 'approved',
      status: 'active',
      working_hours: standardHours,
      has_all_india_permit: false,
      has_national_coverage: false,
      fleet_summary: '8 Local High-Side Trucks and Tippers',
      supported_vehicle_types: [vTypes[0]._id, vTypes[3]._id],
      operational_states: ['Rajasthan'],
      operational_cities: ['Jaipur'],
      rating: 4.6,
      review_count: 18,
      is_mock: true
    });

    // Also sync Vendor records for these 2 transport profiles for legacy sync
    await Vendor.create([
      {
        userId: uTransNational._id,
        businessName: bTransNational.company_name,
        slug: 'apex-bharat-heavy-logistics',
        category: 'Transporters',
        supplierType: 'transport',
        contact: { phone: '9111111116', mobile: '9111111116', email: uTransNational.email },
        location: { state: 'Rajasthan', district: 'Kishangarh', area: 'Marble Mandi', address: 'Plot 45, Transport Nagar' },
        verification: { status: 'approved', isVerified: true },
        is_mock: true
      },
      {
        userId: uTransLocal._id,
        businessName: bTransLocal.company_name,
        slug: 'jaipur-city-stone-express',
        category: 'Transporters',
        supplierType: 'transport',
        contact: { phone: '9111111117', mobile: '9111111117', email: uTransLocal.email },
        location: { state: 'Rajasthan', district: 'Jaipur', area: 'Mansarovar', address: '12, New Aatish Market' },
        verification: { status: 'approved', isVerified: true },
        is_mock: true
      }
    ]);

    // D. Vehicles
    const vehicles = await TransportVehicle.insertMany([
      {
        providerId: bTransNational._id,
        vehicleTypeId: vTypes[0]._id,
        driver_name: 'Rajesh Gurjar',
        driver_phone: '9111111116',
        registration_number: 'RJ-01-GB-4501',
        payload_capacity: 16,
        capacity_unit: 'tons',
        dimensions: { length_ft: 22, width_ft: 7.5, height_ft: 7 },
        permit_type: 'all_india',
        permit_valid_until: new Date(Date.now() + 365 * 86400000),
        availability_status: 'available_now',
        service_type: 'national',
        location: { type: 'Point', coordinates: [74.8655, 26.5744] },
        city_name: 'Kishangarh',
        state_name: 'Rajasthan',
        is_active: true,
        is_mock: true
      },
      {
        providerId: bTransNational._id,
        vehicleTypeId: vTypes[1]._id,
        driver_name: 'Vikram Singh',
        driver_phone: '9111111120',
        registration_number: 'RJ-01-GB-4502',
        payload_capacity: 25,
        capacity_unit: 'tons',
        dimensions: { length_ft: 28, width_ft: 8, height_ft: 8 },
        permit_type: 'all_india',
        permit_valid_until: new Date(Date.now() + 300 * 86400000),
        availability_status: 'available_now',
        service_type: 'national',
        location: { type: 'Point', coordinates: [74.8655, 26.5744] },
        city_name: 'Kishangarh',
        state_name: 'Rajasthan',
        is_active: true,
        is_mock: true
      },
      {
        providerId: bTransLocal._id,
        vehicleTypeId: vTypes[0]._id,
        driver_name: 'Mahesh Choudhary',
        driver_phone: '9111111117',
        registration_number: 'RJ-14-GH-8812',
        payload_capacity: 15,
        capacity_unit: 'tons',
        permit_type: 'state_only',
        availability_status: 'available_now',
        service_type: 'local',
        location: { type: 'Point', coordinates: [75.7683, 26.8522] },
        city_name: 'Jaipur',
        state_name: 'Rajasthan',
        is_active: true,
        is_mock: true
      },
      {
        providerId: bTransLocal._id,
        vehicleTypeId: vTypes[3]._id,
        driver_name: 'Kishan Lal',
        driver_phone: '9111111121',
        registration_number: 'RJ-14-GH-8815',
        payload_capacity: 18,
        capacity_unit: 'tons',
        permit_type: 'local_only',
        availability_status: 'in_service',
        service_type: 'local',
        location: { type: 'Point', coordinates: [75.7800, 26.8600] },
        city_name: 'Jaipur',
        state_name: 'Rajasthan',
        is_active: true,
        is_mock: true
      }
    ]);
    console.log(`Created ${vehicles.length} Transport Vehicles.`);

    // E. Routes
    const locRajasthan = createdLocations.find(l => l.name === 'Rajasthan') || createdLocations[0];
    const locKishangarhCity = locRajasthan.districts.find(d => d.name === 'Kishangarh') || locRajasthan.districts[0];
    const locJaipurCity = locRajasthan.districts.find(d => d.name === 'Jaipur') || locRajasthan.districts[0];

    const sampleRoute = await TransportRoute.create({
      providerId: bTransNational._id,
      origin_city_id: locKishangarhCity._id,
      origin_city_name: 'Kishangarh',
      origin_state_name: 'Rajasthan',
      destination_city_id: locJaipurCity._id,
      destination_city_name: 'Jaipur',
      destination_state_name: 'Rajasthan',
      route_type: 'regular',
      directionality: 'bidirectional',
      direct_route_only: false,
      estimated_transit_days: 1,
      default_freight_rate: 650,
      rate_unit: 'INR per ton',
      is_active: true,
      is_mock: true
    });
    console.log('Created Transport Route: Kishangarh <-> Jaipur.');

    // F. Freight Rates
    await FreightRate.create({
      providerId: bTransNational._id,
      vehicleTypeId: vTypes[0]._id,
      routeId: sampleRoute._id,
      origin_city_name: 'Kishangarh',
      destination_city_name: 'Jaipur',
      pricing_model: 'per_ton',
      amount: 650,
      currency: 'INR',
      unit: 'INR per ton',
      minimum_charge: 9000,
      additional_charges: 'Toll extra at actuals',
      status: 'active',
      is_mock: true
    });
    console.log('Created Freight Rate for Kishangarh -> Jaipur.');

    // G. Sample Transport Inquiry
    await Inquiry.create({
      senderId: uBuyer1._id,
      businessId: bTransNational._id,
      category: 'Transport',
      supplierType: 'transport',
      subject: 'Transport Inquiry: Gangsaw Granite Slabs from Kishangarh to Jaipur',
      message: 'Need 2x 10-wheelers for 30 tons gangsaw granite slabs delivery.',
      quantity: 30,
      unit: 'tons',
      transport_type: 'national',
      vehicle_type: '10-Wheeler Heavy Truck',
      vehicle_quantity: 2,
      cargo_type: 'Gangsaw Granite Slabs',
      pickup_date: new Date(Date.now() + 5 * 86400000),
      expected_delivery_date: new Date(Date.now() + 6 * 86400000),
      special_handling: 'Careful loading required. Slings & wood spacers compulsory.',
      reference_number: 'TR-INQ-MOCK-001',
      pickupLocation: {
        city: 'Kishangarh',
        address: 'Marble Mandi, Kishangarh, Rajasthan'
      },
      deliveryLocation: {
        city: 'Jaipur',
        address: 'Mansarovar, Jaipur, Rajasthan'
      },
      contactInfo: {
        name: 'Amit Kumar',
        mobile: '9111111112',
        email: 'buyer.amit@mockstonemarket.com',
        city: 'Jaipur'
      },
      status: 'submitted',
      is_mock: true
    });
    console.log('Created Sample Transport Inquiry.');

    // H. Sample Transport Quote Request & Provider Response
    const transQuoteReq = await QuoteRequest.create({
      userId: uBuyer1._id,
      businessId: bTransNational._id,
      cargo_type: 'Polished Marble Slabs',
      cargo_weight: 24,
      quantity: 24,
      unit: 'tons',
      required_vehicle_type: '12-Wheeler Heavy Truck',
      vehicle_quantity: 1,
      pickup_location: {
        city: 'Kishangarh',
        address: 'Kishangarh Marble Mandi'
      },
      delivery_location: {
        city: 'Jaipur',
        address: 'Sitapura Industrial Area, Jaipur'
      },
      preferred_pickup_date: new Date(Date.now() + 7 * 86400000),
      budget: 25000,
      message: 'Need 12-wheeler for 24 tons polished marble slabs dispatch.',
      reference_number: 'TR-QR-MOCK-001',
      buyerContact: {
        name: 'Amit Kumar',
        mobile: '9111111112',
        email: 'buyer.amit@mockstonemarket.com',
        city: 'Jaipur'
      },
      status: 'responded',
      is_mock: true
    });

    await QuoteResponse.create({
      quoteRequestId: transQuoteReq._id,
      supplierId: bTransNational._id,
      supplierUserId: uTransNational._id,
      offered_price: 650,
      currency: 'INR',
      unit: 'INR per ton',
      estimated_total: 15600,
      additional_charges: 800,
      vehicle_type: '12-Wheeler Heavy Truck',
      offered_capacity: 25,
      pickup_estimate: new Date(Date.now() + 7 * 86400000),
      delivery_estimate: new Date(Date.now() + 8 * 86400000),
      offer_validity: new Date(Date.now() + 15 * 86400000),
      terms_and_conditions: 'Toll included. Loading/unloading extra or arranged by buyer. GST extra as applicable.',
      reference_number: 'TR-QT-MOCK-001',
      status: 'submitted',
      is_mock: true
    });
    console.log('Created Sample Transport Quote Request & Quote Response.');

    console.log('\n14. Seeding Estimation Module Data...');
    // A. Measurement Units
    await MeasurementUnit.insertMany([
      { name: 'Centimetre', symbol: 'cm', unit_category: 'dimension', conversion_factor: 0.01, is_mock: true },
      { name: 'Inch', symbol: 'inch', unit_category: 'dimension', conversion_factor: 0.0254, is_mock: true },
      { name: 'Foot', symbol: 'feet', unit_category: 'dimension', conversion_factor: 0.3048, is_mock: true },
      { name: 'Square Feet', symbol: 'sqft', unit_category: 'area', conversion_factor: 0.092903, is_mock: true },
      { name: 'Square Metre', symbol: 'sqm', unit_category: 'area', conversion_factor: 1, is_mock: true },
      { name: 'Pieces', symbol: 'pcs', unit_category: 'count', conversion_factor: 1, is_mock: true },
      { name: 'Tonnes', symbol: 'ton', unit_category: 'weight', conversion_factor: 1000, is_mock: true },
      { name: 'Running Feet', symbol: 'rft', unit_category: 'length', conversion_factor: 0.3048, is_mock: true }
    ]);
    console.log('Created 8 Configurable Measurement Units.');

    // B. Sample Slab Estimate
    await Estimate.create({
      reference_number: 'EST-SLAB-2026-MOCK-001',
      owner_user_id: uMfg1._id,
      estimate_type: 'slab',
      company_details_enabled: true,
      company_name_snapshot: 'Royal Rajasthan Granite Processors',
      company_mobile_snapshot: '9111111104',
      company_email_snapshot: 'mfg1@mockstonemarket.com',
      company_address_snapshot: 'Phase 1 Industrial Area, Jalore, Rajasthan',
      payment_terms_snapshot: '50% advance, balance against inspection before truck gate-pass.',
      party_name: 'Sharma Luxury Infra Pvt Ltd',
      party_address: 'C-Scheme, Jaipur, Rajasthan',
      party_contact: '9829011223',
      estimate_date: new Date(),
      currency: 'INR',
      notes: 'All slabs calibrated to 18mm thickness. Surface mirror polished with 12-head line polishing machine.',
      subtotal: 54400,
      total_amount: 54400,
      status: 'finalized',
      slab_details: {
        colour_quality: 'Premium Steel Grey - Gangsaw Cut',
        vehicle_number: 'RJ-19-GB-4422',
        block_lot_number: 'LOT-JAL-2026-44',
        measured_by: 'Kailash Choudhary (Quality Lead)',
        measurement_unit: 'inch',
        area_unit: 'sqft',
        unit_price: 68,
        total_area: 800,
        measurement_rows: [
          { serial_number: 1, length: 120, width: 60, calculated_area: 50 },
          { serial_number: 2, length: 120, width: 60, calculated_area: 50 },
          { serial_number: 3, length: 118, width: 59, calculated_area: 48.347 },
          { serial_number: 4, length: 118, width: 59, calculated_area: 48.347 }
        ]
      },
      is_mock: true
    });
    console.log('Created Sample Slab Estimate.');

    // C. Sample Particular Estimate with Advance Payment
    await Estimate.create({
      reference_number: 'EST-PART-2026-MOCK-001',
      owner_user_id: uMfg1._id,
      estimate_type: 'particular',
      company_details_enabled: true,
      company_name_snapshot: 'Royal Rajasthan Granite Processors',
      company_mobile_snapshot: '9111111104',
      company_address_snapshot: 'Phase 1 Industrial Area, Jalore, Rajasthan',
      payment_terms_snapshot: 'Immediate settlement on delivery verification.',
      party_name: 'Heritage Palace Resorts & Spa',
      party_address: 'Lake Pichola Road, Udaipur, Rajasthan',
      party_contact: '9829144556',
      estimate_date: new Date(),
      currency: 'INR',
      notes: 'Includes edge chamfering, water-repellent sealer application, and wooden crating.',
      subtotal: 135000,
      total_amount: 135000,
      status: 'draft',
      particular_details: {
        items: [
          {
            serial_number: 1,
            particular_name: 'Imperial Black Granite Countertops (32mm laminated edge)',
            quantity: 500,
            unit: 'sqft',
            unit_price: 180,
            calculated_amount: 90000
          },
          {
            serial_number: 2,
            particular_name: 'Hand-Carved Stone Baluster Railings (3ft height)',
            quantity: 30,
            unit: 'pieces',
            unit_price: 1500,
            calculated_amount: 45000
          }
        ],
        total_quantity: 530,
        quantity_summary: [
          { unit: 'sqft', total_quantity: 500 },
          { unit: 'pieces', total_quantity: 30 }
        ],
        payments: [
          {
            amount: 50000,
            payment_date: new Date(),
            payment_method: 'bank_transfer',
            transaction_reference: 'NEFT-88992211',
            notes: 'Advance booking payment confirmed via HDFC Bank',
            status: 'completed',
            created_by: uMfg1._id
          }
        ],
        total_paid: 50000,
        remaining_balance: 85000,
        payment_status: 'partially_paid',
        amount_in_words: 'Eighty Five Thousand Rupees Only'
      },
      is_mock: true
    });
    console.log('Created Sample Particular Estimate with Payment Ledger.');

    console.log('\n15. Seeding Customer Module Data (Customer Account, Addresses, Favorites, Notifications, Tickets, FAQs, AppConfig)...');
    const uCustomer = await User.create({
      name: 'Vikram Malhotra',
      mobile: '9111111118',
      email: 'customer.test@stonemarketindia.com',
      password: passwordHash,
      role: 'customer',
      city: 'Jaipur',
      state: 'Rajasthan',
      whatsapp_number: '9111111118',
      date_of_birth: new Date('1990-05-15'),
      verification_status: 'verified',
      rating: 4.8,
      review_count: 5,
      preferences: { language: 'en', appearance: 'system' },
      notification_preferences: {
        new_inquiry: true,
        lead_messages: true,
        quote_requests: true,
        ad_performance: true,
        subscription_billing: true,
        marketing_emails: false
      },
      quiet_hours: {
        enabled: true,
        start_time: '22:00',
        end_time: '08:00',
        timezone: 'Asia/Kolkata'
      },
      status: 'active',
      is_mock: true
    });

    await CustomerAddress.create([
      {
        userId: uCustomer._id,
        state: 'Rajasthan',
        district: 'Jaipur',
        area: 'C-Scheme',
        full_address: 'B-14, Subhash Marg, C-Scheme, Jaipur',
        pin_code: '302001',
        address_label: 'Home',
        is_default: true,
        is_mock: true
      },
      {
        userId: uCustomer._id,
        state: 'Rajasthan',
        district: 'Kishangarh',
        area: 'Madanganj Industrial Area',
        full_address: 'Plot 42, Marble Mandi Phase 2',
        pin_code: '305801',
        address_label: 'Project Site',
        is_default: false,
        is_mock: true
      }
    ]);

    // Customer favorites
    const sampleProducts = await Product.find({ is_mock: true }).limit(3);
    for (const prod of sampleProducts) {
      await CustomerFavorite.create({
        userId: uCustomer._id,
        productId: prod._id,
        is_mock: true
      });
    }

    // Customer notifications
    await CustomerNotification.create([
      {
        userId: uCustomer._id,
        title: 'New Quotation Received',
        description: 'Royal Rajasthan Granite submitted a quote for your Imperial Black Granite inquiry.',
        category: 'Quote Requests',
        is_read: false,
        deep_link: '/customer/quotations',
        is_mock: true
      },
      {
        userId: uCustomer._id,
        title: 'Welcome to Stone Market India',
        description: 'Discover certified quarries, manufacturers, and transport partners.',
        category: 'System',
        is_read: true,
        deep_link: '/customer/profile',
        is_mock: true
      }
    ]);

    // Active session
    await UserSession.create({
      userId: uCustomer._id,
      session_id: 'mock_sess_cust_1118',
      device_name: 'OnePlus 11 5G (Android 14)',
      device_type: 'mobile',
      ip_address: '103.212.144.10',
      location: 'Jaipur, Rajasthan',
      is_active: true,
      is_mock: true
    });

    // Support ticket
    await SupportTicket.create({
      ticket_number: 'TKT-20261030-001',
      userId: uCustomer._id,
      subject: 'Inquiry regarding transit insurance for stone transport',
      category: 'Orders & Delivery',
      description: 'Does the national transport partner cover transit insurance for delicate marble slabs?',
      priority: 'medium',
      status: 'open',
      messages: [
        {
          sender_id: uCustomer._id,
          sender_role: 'customer',
          sender_name: uCustomer.name,
          message: 'Does the national transport partner cover transit insurance for delicate marble slabs?',
          created_at: new Date()
        }
      ],
      is_mock: true
    });

    // Support FAQs
    const faqCount = await SupportFaq.countDocuments();
    if (faqCount === 0) {
      await SupportFaq.insertMany([
        {
          category: 'Orders & Delivery',
          question: 'How do I track my stone delivery?',
          answer: 'Once a supplier or transport partner confirms your order dispatch, you can view real-time transit updates from the inquiry tracking screen.',
          sort_order: 1,
          is_mock: true
        },
        {
          category: 'Stone Types & Pricing',
          question: 'How is natural stone area calculated?',
          answer: 'Stone slabs are measured by length and width. Area is calculated in square feet or square meters based on standard commercial dimensions.',
          sort_order: 2,
          is_mock: true
        },
        {
          category: 'Quotations & Estimates',
          question: 'Can I request quotations from multiple suppliers simultaneously?',
          answer: 'Yes! When submitting a quotation request, select multi-supplier dispatch to receive competitive quotes from eligible verified suppliers.',
          sort_order: 3,
          is_mock: true
        }
      ]);
    }

    // App Config
    await AppConfig.findOneAndUpdate(
      { key: 'global_config' },
      {
        key: 'global_config',
        app_name: 'Stone Market India',
        app_version: '1.0.0',
        min_supported_version: '1.0.0',
        force_update: false,
        update_url: 'https://play.google.com/store/apps/details?id=com.stonemarketindia.app',
        privacy_policy_url: 'https://stonemarketindia.com/privacy-policy',
        terms_and_conditions_url: 'https://stonemarketindia.com/terms-and-conditions',
        refund_policy_url: 'https://stonemarketindia.com/refund-policy',
        support_email: 'support@stonemarketindia.com',
        support_phone: '+91 9999999999',
        is_mock: true
      },
      { upsert: true, new: true }
    );
    console.log('Created Customer Account (Vikram Malhotra - 9111111118) with addresses, favorites, notifications, tickets & config.');

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
    console.log('  - Buyer 1:      Mobile 9111111112 (Global Infra Buildcon, Jaipur - Verified)');
    console.log('  - Buyer 2:      Mobile 9111111113 (Heritage Palace Resorts, Udaipur - Verified)');
    console.log('  - Buyer 3:      Mobile 9111111114 (Mehta Design Architects, Ahmedabad - Verified)');
    console.log('  - Buyer 4:      Mobile 9111111115 (Shree Ram Distributors, Kishangarh - Pending)');
    console.log('  - Trans Nat:    Mobile 9111111116 (Apex Bharat Heavy Logistics - All India)');
    console.log('  - Trans Local:  Mobile 9111111117 (Jaipur City Stone Express - Local Nearby)');
    console.log('  - Customer:     Mobile 9111111118 (Vikram Malhotra - Jaipur Customer)');
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
