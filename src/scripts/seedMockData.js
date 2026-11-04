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
const AnalyticsEvent = require('../models/AnalyticsEvent');
const PromotionPackage = require('../models/PromotionPackage');
const PromotionCampaign = require('../models/PromotionCampaign');
const PromotionOrder = require('../models/PromotionOrder');
const Payment = require('../models/Payment');
const PromotionInvoice = require('../models/PromotionInvoice');
const PromotionAnalytics = require('../models/PromotionAnalytics');
const CampaignActivityLog = require('../models/CampaignActivityLog');
const InquiryQuotation = require('../models/InquiryQuotation');
const InquiryActivityLog = require('../models/InquiryActivityLog');
const InquiryMessage = require('../models/InquiryMessage');
const Lead = require('../models/Lead');
const LeadNote = require('../models/LeadNote');
const LeadActivityLog = require('../models/LeadActivityLog');
const NotificationPreference = require('../models/NotificationPreference');
const QuietHours = require('../models/QuietHours');
const UserPreferences = require('../models/UserPreferences');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stone_market';

// Clean function to remove all mock data safely
const cleanMockData = async () => {
  console.log('--- Cleaning Up Mock Data ---');
  await Promise.all([
    User.deleteMany({ $or: [{ is_mock: true }, { mobile: { $regex: '^91111111' } }] }),
    Vendor.deleteMany({ $or: [{ is_mock: true }, { 'contact.mobile': { $regex: '^91111111' } }] }),
    BusinessProfile.deleteMany({ is_mock: true }),
    Product.deleteMany({ is_mock: true }),
    AnalyticsEvent.deleteMany({ is_mock: true }),
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
    AppConfig.deleteMany({ is_mock: true }),
    PromotionPackage.deleteMany({ is_mock: true }),
    PromotionCampaign.deleteMany({ is_mock: true }),
    PromotionOrder.deleteMany({ is_mock: true }),
    Payment.deleteMany({ is_mock: true }),
    PromotionInvoice.deleteMany({ is_mock: true }),
    PromotionAnalytics.deleteMany({ is_mock: true }),
    CampaignActivityLog.deleteMany({}),
    InquiryQuotation.deleteMany({ is_mock: true }),
    InquiryActivityLog.deleteMany({}),
    InquiryMessage.deleteMany({ is_mock: true }),
    Lead.deleteMany({ is_mock: true }),
    LeadNote.deleteMany({ is_mock: true }),
    LeadActivityLog.deleteMany({}),
    NotificationPreference.deleteMany({}),
    QuietHours.deleteMany({}),
    UserPreferences.deleteMany({})
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
        about_business: 'Premier granite mine lease holder and block excavation operator in Jalore mining zone.',
        ec_number: 'EC/RJ/MIN/2023/8892',
        ec_clearance_status: 'Clearance Granted',
        mining_lease_number: 'ML-78/2018',
        mining_permit_number: 'MP-2022-4410',
        quarry_specialties: ['Rajasthan Black', 'Black Galaxy', 'Makrana White'],
        monthly_capacity: 15000,
        capacity_unit: 'Ton',
        unit_status: 'both',
        premises_status: 'owned',
        granite_colors: [cGalaxy._id, cAbsBlack._id, cSteelGrey._id],
        machines: [
          { machine_name: 'Diamond Wire Saw Machine', quantity: 4, category: 'Cutting', description: 'High-speed quarry block cutting wire saw', operational_status: 'Operational' },
          { machine_name: 'Hydraulic Mining Excavator', quantity: 2, category: 'Excavation', description: 'Heavy 35-ton crawler excavator', operational_status: 'Operational' },
          { machine_name: 'Heavy Mining Loader', quantity: 3, category: 'Material Handling', description: 'Front-wheel 40-ton block loader', operational_status: 'Operational' },
          { machine_name: 'Wire Saw Excavator Unit', quantity: 1, category: 'Excavation', description: 'Mobile crawler wire saw unit', operational_status: 'Operational' }
        ],
        custom_stone_varieties: [
          { name: 'Rajasthan Black Granite Block', color: 'Deep Black', stone_type: 'Granite', description: 'Solid dark black granite blocks', available_quantity: '2,500 Tons' },
          { name: 'Black Galaxy Raw Block', color: 'Black with Golden Flecks', stone_type: 'Granite', description: 'Quarry face extracted rough blocks', available_quantity: '1,200 Tons' },
          { name: 'Makrana White Marble Block', color: 'Pure White', stone_type: 'Marble', description: 'High calcium temple grade marble blocks', available_quantity: '800 Tons' }
        ],
        owners: [
          {
            name: 'Ramesh Patel',
            designation: 'Quarry Lease Holder & MD',
            phone: '9111111102',
            whatsapp: '9111111102',
            email: 'ramesh.mining@mockstonemarket.com',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
            is_primary: true
          }
        ],
        address: { state: 'Rajasthan', district: 'Jalore', area: 'Bagra Quarry Hub', full_address: 'Survey No. 42, Bagra Mining Belt, Jalore, Rajasthan 343025' },
        working_hours: standardHours,
        factory_timings: '07:00 AM – 06:00 PM (Monday to Saturday)',
        rating: 4.8,
        review_count: 14,
        is_verified: true,
        verification_steps: {
          phone: { phone: '9111111102', status: 'verified', verified_at: new Date() },
          email: { email: 'ramesh.mining@mockstonemarket.com', status: 'verified', verified_at: new Date() },
          business: { registration_type: 'Mining Lease Deed', registration_number: 'ML-78/2018', status: 'verified', reviewed_at: new Date() },
          gst: { gstin: '08AAACA1234A1Z1', status: 'verified', reviewed_at: new Date() },
          bank: { bank_name: 'State Bank of India', account_number: '****4455', status: 'verified', reviewed_at: new Date() }
        },
        verification_documents: [
          { title: 'Mining Lease Deed ML-78/2018', file_type: 'mining_lease', status: 'verified', url: 'https://example.com/mining-lease.pdf' },
          { title: 'Environmental Clearance Certificate EC/RJ/MIN/2023/8892', file_type: 'environment_clearance', status: 'verified', url: 'https://example.com/ec.pdf' }
        ],
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
        logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=300&q=80',
        cover_image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=1200&q=80',
        gst_number: '08AAACR9988C1Z3',
        established_year: 2015,
        property_type: 'Owned Factory',
        factory_type: 'owned',
        premises_status: 'owned',
        unit_status: 'export',
        factory_timings: '08:00 AM - 08:00 PM (Monday to Saturday)',
        company_details: 'Export-oriented modern granite processing factory with gangsaw and multi-head line polishers.',
        about_business: 'Royal Rajasthan Granite Factory is an export-oriented modern granite processing factory with gangsaw and multi-head line polishers located in the RIICO industrial hub of Jalore.',
        manufacturer_category: mfgSlabs._id,
        iec_number: '0512034918',
        is_export_unit: true,
        export_countries: ['USA', 'UAE', 'United Kingdom', 'Germany', 'Australia'],
        granite_colors: [cAbsBlack._id, cSteelGrey._id, cLakhaRed._id, cAlaskaWhite._id],
        custom_stone_varieties: [
          { name: 'Rajasthan Black', category: 'Black Granite', finish: 'Polished' },
          { name: 'Rosy Pink', category: 'Pink Granite', finish: 'Flamed' },
          { name: 'Tan Brown', category: 'Brown Granite', finish: 'Honed' }
        ],
        monthly_capacity: 250000,
        capacity_unit: 'Sq.Ft',
        machines: [
          { machine_name: 'Multi-Blade Gangsaw', quantity: 4, category: 'Cutting', description: 'Heavy gangsaw frames for processing rough granite blocks' },
          { machine_name: '16-Head Line Polisher', quantity: 2, category: 'Polishing', description: 'Automatic abrasive line polisher achieving 90+ gloss' },
          { machine_name: 'Automated Bridge Cutter', quantity: 6, category: 'Sizing', description: 'CNC diamond bridge cutters for calibrated edge cutting' },
          { machine_name: 'Diamond Wire Saw', quantity: 2, category: 'Squaring', description: 'High speed block squaring and profiling wire saw' }
        ],
        owners: [
          {
            name: 'Suresh Sharma',
            designation: 'Managing Director',
            phone: '9111111104',
            whatsapp: '9111111104',
            email: 'suresh.mfg@mockstonemarket.com',
            is_primary: true,
            photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
          },
          {
            name: 'Kailash Sharma',
            designation: 'Plant Head & Quality Director',
            phone: '9111111124',
            whatsapp: '9111111124',
            email: 'kailash@mockstonemarket.com',
            is_primary: false,
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
          }
        ],
        gallery_photos: [
          { url: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80', is_cover: true, title: 'Main Factory Complex & Stockyard' },
          { url: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=800&q=80', is_cover: false, title: 'Multi-Blade Gangsaw Line' },
          { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80', is_cover: false, title: 'Polished Granite Slabs Stockyard' }
        ],
        gallery_videos: [
          {
            title: 'Factory Production Tour & Gangsaw Slicing in Action',
            youtube_url: 'https://www.youtube.com/watch?v=mock-tour',
            duration: '3:45',
            thumbnail: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
            source_type: 'youtube'
          }
        ],
        verification_steps: {
          phone: { phone: '9111111104', status: 'verified', verified_at: new Date('2026-01-15') },
          email: { email: 'suresh.mfg@mockstonemarket.com', status: 'verified', verified_at: new Date('2026-01-16') },
          business: { registration_type: 'Private Limited', registration_number: 'U14101RJ2015PTC048991', document_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', status: 'verified', reviewed_at: new Date('2026-01-20') },
          gst: { gstin: '08AAACR9988C1Z3', certificate_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', status: 'verified', reviewed_at: new Date('2026-01-20') },
          bank: { account_holder_name: 'Royal Rajasthan Granite Factory', bank_name: 'State Bank of India', account_number: '38192837491', ifsc_code: 'SBIN0001234', cheque_document_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', status: 'verified', reviewed_at: new Date('2026-01-22') }
        },
        verification_timeline: [
          { step: 'phone', status: 'verified', title: 'Phone Verified', description: 'Phone 9111111104 verified via OTP' },
          { step: 'email', status: 'verified', title: 'Email Verified', description: 'suresh.mfg@mockstonemarket.com confirmed' },
          { step: 'gst', status: 'verified', title: 'GSTIN Verified', description: '08AAACR9988C1Z3 verified via GST portal' },
          { step: 'bank', status: 'verified', title: 'Bank Account Verified', description: 'SBI A/C verified via Penny Drop' },
          { step: 'business', status: 'verified', title: 'Business Registration Verified', description: 'MCA registration documents verified by admin' }
        ],
        verification_documents: [
          { title: 'GST Registration Certificate', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', file_type: 'application/pdf', status: 'approved' },
          { title: 'Factory License & Pollution Board NOC', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', file_type: 'application/pdf', status: 'approved' }
        ],
        is_verified: true,
        verification_status: 'approved',
        address: {
          state: 'Rajasthan',
          district: 'Jalore',
          area: 'Phase 1 Industrial Area',
          industrial_area: 'RIICO Industrial Area Phase 1',
          full_address: 'F-142, RIICO Industrial Area Phase 1, Jalore, Rajasthan 343001',
          postal_code: '343001',
          country: 'India'
        },
        working_hours: standardHours,
        rating: 4.8,
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
        business_category: 'Godown & Showrooms',
        business_subcategory: 'Granite & Marble Showroom',
        short_description: 'Luxury marble experience studio featuring full bookmatch slabs, exotic onyx, and designer stone installations.',
        about_business: 'Leading destination in Jaipur for imported marbles, exotic onyx and luxury granite live displays.',
        gst_number: '08AAACG7788F1Z6',
        business_registration_number: 'REG-RJ-2016-7788',
        established_year: 2016,
        company_details: 'Luxury marble experience studio featuring full bookmatch slabs, exotic onyx, and designer stone installations.',
        showroom_type: 'Retail & Wholesale',
        total_display_area: 16000,
        display_area_unit: 'Sq.ft',
        total_storage_capacity: 55000,
        storage_capacity_unit: 'Sq.ft',
        stone_categories_available: ['Granite', 'Marble', 'Sandstone', 'Limestone', 'Quartzite', 'Slate', 'Engineered Stone', 'Tiles', 'Other Natural Stones'],
        display_area: 16000,
        premises_status: 'owned',
        virtual_tour_url: 'https://my.matterport.com/show/?m=mock-grandeur-studio',
        showroom_product_types: [showItalian._id, showMarble._id, showOnyx._id, showGranite._id],
        brands: [bRK._id, bCMC._id, bAClass._id],
        owners: [{ name: 'Vikram Singhania', designation: 'Managing Director & Partner', phone: '9111111107', whatsapp: '9111111107', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', is_primary: true }],
        address: { state: 'Rajasthan', district: 'Jaipur', area: 'Mansarovar Industrial Area', commercial_area: 'Mansarovar Commercial Stone Hub', full_address: 'B-12, Main RIICO Road, Mansarovar, Jaipur, Rajasthan 302020', showroom_address: 'B-12, Main RIICO Road, Mansarovar, Jaipur, Rajasthan 302020' },
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
        business_category: 'Godown & Showrooms',
        business_subcategory: 'Granite & Marble Showroom',
        short_description: 'Largest indoor stone showroom in Kishangarh displaying 300+ varieties of imported marble and quartz.',
        about_business: 'Mega stone warehouse and retail galleria with continuous stock of 100,000+ sq.ft.',
        gst_number: '08AAACA3344G1Z7',
        business_registration_number: 'REG-RJ-2010-3344',
        established_year: 2010,
        company_details: 'Largest indoor stone showroom in Kishangarh displaying 300+ varieties of imported marble and quartz.',
        showroom_type: 'Wholesale Godown',
        total_display_area: 28000,
        display_area_unit: 'Sq.ft',
        total_storage_capacity: 120000,
        storage_capacity_unit: 'Sq.ft',
        stone_categories_available: ['Marble', 'Granite', 'Travertine', 'Quartzite', 'Engineered Stone', 'Tiles'],
        display_area: 28000,
        premises_status: 'owned',
        virtual_tour_url: 'https://my.matterport.com/show/?m=mock-apex-gallery',
        showroom_product_types: [showItalian._id, showTravertine._id, showQuartz._id, showGranite._id],
        brands: [bNitco._id, bPokarna._id, bAsian._id],
        owners: [{ name: 'Ankit Agarwal', designation: 'Founding Partner', phone: '9111111108', whatsapp: '9111111108', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', is_primary: true }],
        address: { state: 'Rajasthan', district: 'Kishangarh', area: 'Marble Mandi', commercial_area: 'Marble Mandi Phase 2', full_address: 'Opposite Stone Mandi Gate 2, Madanganj, Kishangarh, Rajasthan 305801', showroom_address: 'Opposite Stone Mandi Gate 2, Madanganj, Kishangarh, Rajasthan 305801' },
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
        business_category: 'Godown & Showrooms',
        business_subcategory: 'Granite & Marble Showroom',
        short_description: 'Modern architectural stone experience gallery showcasing engineered quartz, granite, and sandstone tiles.',
        about_business: 'South India premier granite and engineered quartz showroom with interactive design consultation.',
        gst_number: '29AAACS6655H1Z8',
        business_registration_number: 'REG-KA-2018-6655',
        established_year: 2018,
        company_details: 'Modern architectural stone experience gallery showcasing engineered quartz, granite, and sandstone tiles.',
        showroom_type: 'Retail Showroom',
        total_display_area: 14000,
        display_area_unit: 'Sq.ft',
        total_storage_capacity: 45000,
        storage_capacity_unit: 'Sq.ft',
        stone_categories_available: ['Granite', 'Quartzite', 'Sandstone', 'Engineered Stone', 'Tiles'],
        display_area: 14000,
        premises_status: 'rented',
        virtual_tour_url: 'https://my.matterport.com/show/?m=mock-silicon-studio',
        showroom_product_types: [showGranite._id, showQuartz._id, showSandstone._id],
        brands: [bAsian._id, bPokarna._id],
        owners: [{ name: 'Gautam Hegde', designation: 'Partner & Chief Curator', phone: '9111111109', whatsapp: '9111111109', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', is_primary: true }],
        address: { state: 'Karnataka', district: 'Bengaluru', area: 'Jigani Industrial Area', commercial_area: 'Jigani Stone Hub', full_address: 'Plot 45, Phase II, Jigani Industrial Area, Bengaluru, Karnataka 560105', showroom_address: 'Plot 45, Phase II, Jigani Industrial Area, Bengaluru, Karnataka 560105' },
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
        business_category: 'Stone Trader',
        business_subcategory: 'Wholesale Stone Trader & Exporter',
        short_description: 'Premier stone trading house in Kishangarh sourcing quality rough blocks, Gangsaw slabs, and full container shipments.',
        about_business: 'Nationwide commercial intermediary connecting granite & marble quarries with international buyers and domestic stockists.',
        gst_number: '08AAACN5566I1Z9',
        business_registration_number: 'REG-TRADER-RJ-2013-5566',
        trade_license_number: 'TL-KSH-2013-1122',
        established_year: 2013,
        company_details: 'Nationwide stockist & supplier of raw rough blocks, Gangsaw slabs, and container loads for domestic distributors.',
        trader_categories: [trBlock._id, trSlab._id, trRaw._id],
        trader_type: ['Wholesaler', 'Stockist', 'Exporter'],
        trading_business_types: [
          'Wholesale Stone Trader',
          'Exporter',
          'Stone Distributor',
          'Stockist',
          'Bulk Material Supplier'
        ],
        trading_specializations: [
          'Granite',
          'Marble',
          'Sandstone',
          'Limestone',
          'Quartzite',
          'Tiles',
          'Other Natural Stones'
        ],
        trading_capabilities: [
          'Domestic Trading',
          'International Trading',
          'Wholesale Supply',
          'Bulk Orders',
          'Custom Orders'
        ],
        monthly_trading_volume: 8500,
        trading_volume_unit: 'Tons',
        min_order_quantity: 50,
        max_order_capacity: 20000,
        preferred_order_type: 'Wholesale & Container Orders',
        supply_network_coverage: 'Pan India & Export to Middle East, Europe, USA',
        operating_markets: ['Domestic', 'International'],
        iec_number: '0518776219',
        owners: [
          { name: 'Manoj Gupta', designation: 'Managing Director', phone: '9111111110', whatsapp: '9111111110', email: 'manoj.trader@mockstonemarket.com', is_primary: true, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
          { name: 'Rahul Verma', designation: 'General Manager - Sales', phone: '9111111120', whatsapp: '9111111120', email: 'sales@mockstonemarket.com', is_primary: false, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' }
        ],
        address: {
          state: 'Rajasthan',
          district: 'Ajmer',
          commercial_area: 'New Marble Market Kishangarh',
          area: 'Madanganj',
          office_address: 'Shop 14-16, New Marble Market, Madanganj, Kishangarh, Rajasthan 305801',
          full_address: 'Shop 14-16, New Marble Market, Madanganj, Kishangarh, Rajasthan 305801'
        },
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
        business_category: 'Stone Trader',
        business_subcategory: 'Wholesale Natural Stone & Landscape Supplier',
        short_description: 'Global exporters of hand-carved stone monuments, tumbled cobbles, sandstone tiles, and custom building elements.',
        about_business: 'Leading natural stone supplier and bulk exporter specializing in Rajasthani sandstone, slate, and architectural stone.',
        gst_number: '08AAACS1199J1Z0',
        business_registration_number: 'REG-TRADER-RJ-2014-1199',
        trade_license_number: 'TL-JPR-2014-3388',
        established_year: 2014,
        company_details: 'Suppliers of hand-carved stone monuments, landscape cobbles, sandstone tiles, and custom building elements.',
        trader_categories: [trSlab._id, trMonument._id, trLandscape._id],
        trader_type: ['Wholesaler', 'Exporter'],
        trading_business_types: [
          'Wholesale Stone Trader',
          'Exporter',
          'Commission Agent',
          'Stone Supplier'
        ],
        trading_specializations: [
          'Sandstone',
          'Slate',
          'Limestone',
          'Granite',
          'Marble',
          'Other Natural Stones'
        ],
        trading_capabilities: [
          'Domestic Trading',
          'International Trading',
          'Exporting',
          'Wholesale Supply',
          'Custom Orders'
        ],
        monthly_trading_volume: 4200,
        trading_volume_unit: 'Metric Tons',
        min_order_quantity: 25,
        max_order_capacity: 10000,
        preferred_order_type: 'Bulk Export & Container Shipments',
        supply_network_coverage: 'Export to UK, Germany, Australia, USA',
        operating_markets: ['International'],
        iec_number: '0519334812',
        owners: [
          { name: 'Devendra Singh', designation: 'Partner', phone: '9111111111', whatsapp: '9111111111', email: 'devendra.trader@mockstonemarket.com', is_primary: true, photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' }
        ],
        address: {
          state: 'Rajasthan',
          district: 'Jaipur',
          commercial_area: 'Sitapura Export Zone',
          area: 'Sitapura',
          office_address: 'G-190, Export Promotion Industrial Park, Sitapura, Jaipur, Rajasthan 302022',
          full_address: 'G-190, Export Promotion Industrial Park, Sitapura, Jaipur, Rajasthan 302022'
        },
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
        company_name: 'Apex Infra Buildcon Stone Sourcing',
        business_category: 'Stone Buyer',
        business_subcategory: 'Infrastructure & Commercial Procurement',
        gst_number: '08AAACG1122K1Z5',
        established_year: 2012,
        company_type: 'Private Limited',
        company_details: 'Leading residential high-rise and commercial infrastructure developer in North & Western India. Procuring over 200,000 sqft granite and marble annually.',
        buyer_types: [btConst._id, btBuilder._id],
        buyer_business_types: ['Infrastructure Company', 'Commercial Developer', 'Contractor'],
        purchasing_specializations: ['Granite Slabs', 'Marble Blocks', 'Paving Stones', 'Cut-to-Size Tiles'],
        ongoing_projects_count: 8,
        annual_purchasing_volume: 250000,
        purchasing_volume_unit: 'Sq.ft',
        procurement_capacity: '25,000+ Sq.ft / Month',
        sourcing_scope: 'Domestic',
        procurement_regions: ['Rajasthan', 'Gujarat', 'Delhi NCR', 'Maharashtra'],
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
        owners: [
          {
            name: 'Rajesh V. Patel',
            designation: 'Head of Procurement',
            phone: '+91 98765 11223',
            email: 'procurement@apexinfra.com',
            whatsapp: '+91 98765 11223',
            is_primary: true
          }
        ],
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
        businessProfileId: createdBusinesses[0]._id,
        business_type: 'mining',
        sku: 'MINE-GRAN-2026-001',
        name: 'Rough Black Galaxy Granite Block',
        color_name: 'Black Galaxy',
        material: 'Granite',
        description: 'First choice premium rough block with dense golden flecks, straight from the Aravalli quarry.',
        category: 'Mining',
        subcategory: 'Granite Blocks',
        graniteColors: ['Black Galaxy'],
        finish: 'Natural Block',
        quality: 'Export Grade',
        pattern: 'Spotted',
        block_dimensions: { length: 10, width: 5, height: 5, dimension_unit: 'FEET' },
        volume_cbm: 7.079,
        size: '10 × 5 × 5 FEET',
        weight: 22,
        weight_unit: 'TON',
        price: 35000,
        selling_price: 35000,
        pricing_unit: 'CU.MTR',
        quantity: 45,
        quantity_unit: 'BLOCK',
        available_stock: 45,
        stock: 45,
        stock_unit: 'BLOCK',
        priceRange: { min: 25000, max: 45000, unit: 'Ton', visible: true },
        specifications: [
          { key: 'Color', value: 'Black Galaxy with Gold Specks' },
          { key: 'Block Volume', value: '7.079 CBM' },
          { key: 'Density', value: '2.95 g/cm3' },
          { key: 'Quarry Origin', value: 'Jalore, Rajasthan' }
        ],
        images: [
          'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=800&q=80'
        ],
        cover_image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[0]._id,
        businessProfileId: createdBusinesses[0]._id,
        business_type: 'mining',
        sku: 'MINE-GRAN-2026-002',
        name: 'Absolute Black Quarry Rough Block',
        color_name: 'Absolute Black',
        material: 'Granite',
        description: 'Zero variation pitch-black gangsaw size block for high-end monuments and slabs.',
        category: 'Mining',
        subcategory: 'Granite Blocks',
        graniteColors: ['Absolute Black'],
        finish: 'Natural Block',
        quality: 'Super Premium',
        pattern: 'Plain / Solid',
        block_dimensions: { length: 3, width: 2, height: 1.5, dimension_unit: 'METER' },
        volume_cbm: 9,
        size: '3 × 2 × 1.5 METER',
        weight: 27,
        weight_unit: 'TON',
        price: 42000,
        selling_price: 42000,
        pricing_unit: 'CU.MTR',
        quantity: 30,
        quantity_unit: 'BLOCK',
        available_stock: 30,
        stock: 30,
        stock_unit: 'BLOCK',
        priceRange: { min: 30000, max: 55000, unit: 'Ton', visible: true },
        specifications: [
          { key: 'Color', value: 'Jet Black' },
          { key: 'Volume', value: '9.0 CBM' },
          { key: 'Compressive Strength', value: '220 MPa' }
        ],
        images: [
          'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=800&q=80'
        ],
        cover_image: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=800&q=80',
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
        businessProfileId: createdBusinesses[2]._id,
        name: 'Export Quality Steel Grey Granite Slab',
        material: 'Granite',
        description: 'Mirror polished 18mm & 20mm Gangsaw slabs with epoxy resin backing and sharp edge calibration.',
        category: 'Manufacturer',
        subcategory: 'Granite Slabs',
        graniteColors: ['Steel Grey'],
        pattern: 'Consistent Grain & Micro Flecks',
        finish: 'High Gloss Line Polished (90+ Glossometer)',
        size: '10ft x 6ft (Gangsaw)',
        thickness: '18mm / 20mm',
        quality: 'Premium First Choice',
        approx_weight: '75 kg/sq.m',
        country_of_origin: 'India',
        applications: ['Kitchen Countertops', 'Flooring', 'Commercial Cladding'],
        selling_price: 110,
        pricing_unit: 'Sq.ft',
        quantity: 35000,
        quantity_unit: 'Sq.ft',
        available_stock: 18000,
        stock_unit: 'Sq.ft',
        availability_status: 'in_stock',
        target_publishing: {
          states: ['Rajasthan', 'Gujarat', 'Maharashtra', 'Karnataka'],
          districts: ['Jaipur', 'Kishangarh', 'Ahmedabad', 'Mumbai'],
          categories: ['Granite Manufacturer', 'Showroom']
        },
        publishing_status: 'published',
        views: 480,
        inquiry_count: 24,
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
        cover_image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[2]._id,
        businessProfileId: createdBusinesses[2]._id,
        name: 'Lakha Red Premium Granite Slab',
        material: 'Granite',
        description: 'Vibrant deep-red granite slabs ideal for exterior wall cladding and monumental staircases.',
        category: 'Manufacturer',
        subcategory: 'Granite Slabs',
        graniteColors: ['Lakha Red'],
        pattern: 'Speckled Ruby Red Matrix',
        finish: 'Polished / Flamed available',
        size: '250 x 140 cm up',
        thickness: '20mm',
        quality: 'First Choice Export Quality',
        approx_weight: '78 kg/sq.m',
        country_of_origin: 'India',
        applications: ['Monuments', 'Exterior Cladding', 'Stairs & Risers'],
        selling_price: 165,
        pricing_unit: 'Sq.ft',
        quantity: 20000,
        quantity_unit: 'Sq.ft',
        available_stock: 9500,
        stock_unit: 'Sq.ft',
        availability_status: 'in_stock',
        target_publishing: {
          states: ['Rajasthan', 'Delhi', 'Punjab', 'Haryana'],
          districts: ['Jaipur', 'Delhi NCR', 'Chandigarh'],
          categories: ['Granite Manufacturer', 'Showroom']
        },
        publishing_status: 'published',
        views: 320,
        inquiry_count: 14,
        priceRange: { min: 145, max: 190, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Thickness', value: '20mm' },
          { key: 'Finish', value: 'Polished / Flamed available' },
          { key: 'Size', value: '250 x 140 cm up' }
        ],
        images: [
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
        ],
        cover_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        stock_status: 'in_stock',
        featured: false,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[2]._id,
        businessProfileId: createdBusinesses[2]._id,
        name: 'Alaska White Exotic Granite Slab',
        material: 'Granite',
        description: 'Striking silver-white background with frost highlights and dark onyx veining.',
        category: 'Manufacturer',
        subcategory: 'Granite Slabs',
        graniteColors: ['Alaska White'],
        pattern: 'Flowing Silver & Onyx Veining',
        finish: 'Leather / Polish',
        size: '300 x 180 cm Jumbo Gangsaw',
        thickness: '20mm',
        quality: 'Super Luxury Bookmatch',
        approx_weight: '75 kg/sq.m',
        country_of_origin: 'India',
        applications: ['Kitchen Islands', 'Feature Walls', 'Luxury Bathrooms'],
        selling_price: 210,
        pricing_unit: 'Sq.ft',
        quantity: 15000,
        quantity_unit: 'Sq.ft',
        available_stock: 6200,
        stock_unit: 'Sq.ft',
        availability_status: 'in_stock',
        target_publishing: {
          states: ['Rajasthan', 'Maharashtra', 'Karnataka', 'Telangana'],
          districts: ['Jaipur', 'Mumbai', 'Bengaluru', 'Hyderabad'],
          categories: ['Granite Manufacturer', 'Showroom']
        },
        publishing_status: 'published',
        views: 610,
        inquiry_count: 38,
        priceRange: { min: 180, max: 260, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Thickness', value: '20mm' },
          { key: 'Finish', value: 'Leather / Polish' },
          { key: 'Size', value: '300 x 180 cm Jumbo Gangsaw' }
        ],
        images: [
          'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80'
        ],
        cover_image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
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
        businessProfileId: createdBusinesses[5]._id,
        business_type: 'showroom',
        sku: 'SHW-STAT-2026-1001',
        name: 'Imported Statuario Extra Italian Marble',
        material: 'Marble',
        short_description: 'Pure alabaster white background with dramatic grey and gold feather veining. Perfect bookmatched pairs available.',
        description: 'Pure alabaster white background with dramatic grey and gold feather veining. Perfect bookmatched pairs available.',
        category: 'Showroom',
        subcategory: 'Italian Marble',
        pattern: 'Bookmatch',
        finish: 'Mirror Polished',
        size: '10 × 6 ft',
        thickness: '18 mm',
        quality: 'Super Premium',
        selling_price: 1150,
        price: 1150,
        pricing_unit: 'Per Sq.ft',
        available_stock: 4500,
        stock: 4500,
        stock_unit: 'Sq.ft',
        quantity: 4500,
        quantity_unit: 'Sq.ft',
        availability_status: 'In Stock',
        low_stock_threshold: 15,
        is_low_stock: false,
        is_out_of_stock: false,
        country_of_origin: 'Italy',
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
        cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        stock_status: 'in_stock',
        featured: true,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[5]._id,
        businessProfileId: createdBusinesses[5]._id,
        business_type: 'showroom',
        sku: 'SHW-ONYX-2026-1002',
        name: 'Honey Gold Translucent Onyx Slab',
        material: 'Onyx',
        short_description: 'Exquisite backlit luxury onyx slab creating dramatic warm ambience for bar counters and feature walls.',
        description: 'Exquisite backlit luxury onyx slab creating dramatic warm ambience for bar counters and feature walls.',
        category: 'Showroom',
        subcategory: 'Onyx',
        pattern: 'Veined',
        finish: 'High Gloss Polished',
        size: '8 × 4 ft',
        thickness: '16 mm',
        quality: 'Super Premium',
        selling_price: 1450,
        price: 1450,
        pricing_unit: 'Per Sq.ft',
        available_stock: 1200,
        stock: 1200,
        stock_unit: 'Sq.ft',
        quantity: 1200,
        quantity_unit: 'Sq.ft',
        availability_status: 'In Stock',
        low_stock_threshold: 15,
        is_low_stock: false,
        is_out_of_stock: false,
        country_of_origin: 'Iran',
        priceRange: { min: 800, max: 2200, unit: 'Sq.Ft', visible: true },
        specifications: [
          { key: 'Backlight Capability', value: '100% Translucent' },
          { key: 'Origin', value: 'Iran' },
          { key: 'Thickness', value: '16mm' }
        ],
        images: [
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
        ],
        cover_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
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
        businessProfileId: createdBusinesses[6]._id,
        business_type: 'showroom',
        sku: 'SHW-TRAV-2026-1003',
        name: 'Roman Beige Vein-Cut Travertine Slab',
        material: 'Travertine',
        short_description: 'Authentic porous Italian travertine filled with transparent resin and honed for a warm Mediterranean appeal.',
        description: 'Authentic porous Italian travertine filled with transparent resin and honed for a warm Mediterranean appeal.',
        category: 'Showroom',
        subcategory: 'Travertine',
        pattern: 'Veined',
        finish: 'Honed',
        size: '9 × 5 ft',
        thickness: '18 mm',
        quality: 'Premium',
        selling_price: 480,
        price: 480,
        pricing_unit: 'Per Sq.ft',
        available_stock: 3500,
        stock: 3500,
        stock_unit: 'Sq.ft',
        quantity: 3500,
        quantity_unit: 'Sq.ft',
        availability_status: 'In Stock',
        low_stock_threshold: 15,
        is_low_stock: false,
        is_out_of_stock: false,
        country_of_origin: 'Italy',
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
        cover_image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
        stock_status: 'in_stock',
        featured: false,
        status: 'active',
        is_mock: true
      },
      {
        vendorId: createdBusinesses[6]._id,
        businessProfileId: createdBusinesses[6]._id,
        business_type: 'showroom',
        sku: 'SHW-QUAR-2026-1004',
        name: 'Calacatta Gold Engineered Quartz Slab',
        material: 'Engineered Stone',
        short_description: 'Non-porous stain and scratch resistant engineered quartz for luxury kitchen countertops.',
        description: 'Non-porous stain and scratch resistant engineered quartz for luxury kitchen countertops.',
        category: 'Showroom',
        subcategory: 'Quartz',
        pattern: 'Veined',
        finish: 'Polished',
        size: '10 × 5 ft',
        thickness: '20 mm',
        quality: 'Premium',
        selling_price: 360,
        price: 360,
        pricing_unit: 'Per Sq.ft',
        available_stock: 2200,
        stock: 2200,
        stock_unit: 'Sq.ft',
        quantity: 2200,
        quantity_unit: 'Sq.ft',
        availability_status: 'In Stock',
        low_stock_threshold: 15,
        is_low_stock: false,
        is_out_of_stock: false,
        country_of_origin: 'India',
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
        cover_image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
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
      },
      {
        userId: uBuyer1._id,
        businessId: createdBusinesses[2]._id, // Royal Rajasthan Granite
        productId: createdProducts[2]._id,
        quantity: 15000,
        unit: 'Sq.Ft',
        message: 'Export tender quotation for 20mm Gangsaw Steel Grey slabs with mirror finish.',
        status: 'pending',
        is_mock: true
      }
    ]);
    console.log('Created sample Inquiries and Quote Requests.');

    console.log('\n9b. Seeding Manufacturer Analytics Events...');
    const now = new Date();
    const analyticsEventsToCreate = [];

    for (let d = 0; d < 7; d++) {
      const eventDate = new Date(now);
      eventDate.setDate(now.getDate() - d);

      for (let v = 0; v < 8 + (d % 4) * 3; v++) {
        analyticsEventsToCreate.push({
          businessId: createdBusinesses[2]._id,
          eventType: 'profile_view',
          visitorId: `visitor-${d}-${v}`,
          visitorType: v % 2 === 0 ? 'new' : 'returning',
          source: v % 3 === 0 ? 'Marketplace Search' : v % 3 === 1 ? 'Category Pages' : 'Service Detail',
          location: {
            city: ['Jaipur', 'Kishangarh', 'Ahmedabad', 'Bengaluru', 'Delhi NCR'][v % 5],
            state: ['Rajasthan', 'Rajasthan', 'Gujarat', 'Karnataka', 'Delhi'][v % 5],
            country: 'India'
          },
          timestamp: eventDate,
          is_mock: true
        });
      }

      for (let p = 0; p < 12 + (d % 3) * 4; p++) {
        analyticsEventsToCreate.push({
          businessId: createdBusinesses[2]._id,
          eventType: 'product_view',
          productId: createdProducts[2]._id,
          visitorId: `visitor-prod-${d}-${p}`,
          source: p % 2 === 0 ? 'Marketplace Search' : 'Advertisement',
          location: { city: 'Jaipur', state: 'Rajasthan' },
          timestamp: eventDate,
          is_mock: true
        });
      }

      if (d % 2 === 0) {
        analyticsEventsToCreate.push({
          businessId: createdBusinesses[2]._id,
          eventType: 'contact_click',
          visitorId: `visitor-click-${d}`,
          source: 'Marketplace Search',
          location: { city: 'Ahmedabad', state: 'Gujarat' },
          timestamp: eventDate,
          is_mock: true
        });
      }
    }

    await AnalyticsEvent.insertMany(analyticsEventsToCreate);
    console.log(`Created ${analyticsEventsToCreate.length} Analytics Events for Manufacturer.`);

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

    // ==========================================
    // 17. Seeding Promotion Packages & Campaigns (Phase 2)
    // ==========================================
    console.log('\n17. Seeding Ads & Promotion Packages, Campaigns, Orders & Analytics...');
    const feedPackages = await PromotionPackage.insertMany([
      {
        promotion_type: 'feed',
        package_name: 'Starter Feed Blast',
        description: 'Promote selected product across discovery feed with 2.5x inquiry potential.',
        price: 499,
        duration_days: 7,
        promotional_multiplier: '2.5x Inquiries',
        badge_label: 'Sponsored',
        theme_color: 'blue',
        display_order: 1,
        benefits: [
          'Promote selected product across discovery feed.',
          'Direct inquiry button for buyers.',
          '2.5x inquiry potential versus standard posts.'
        ],
        status: 'active',
        is_mock: true
      },
      {
        promotion_type: 'feed',
        package_name: 'Growth Feed Blast',
        description: 'Priority placement in buyer home feed with WhatsApp and Call action buttons.',
        price: 999,
        duration_days: 15,
        promotional_multiplier: '5x Inquiries',
        badge_label: 'Sponsored',
        theme_color: 'blue',
        display_order: 2,
        benefits: [
          'Priority placement in buyer home feed.',
          'Direct WhatsApp and Call action buttons.',
          '5x inquiry potential and higher engagement.'
        ],
        status: 'active',
        is_mock: true
      },
      {
        promotion_type: 'feed',
        package_name: 'Mega Domination',
        description: 'Maximum priority in relevant stone discovery feeds with verified sponsored tag.',
        price: 1799,
        duration_days: 30,
        promotional_multiplier: '10x Inquiries',
        badge_label: 'Sponsored',
        theme_color: 'blue',
        display_order: 3,
        benefits: [
          'Maximum priority in relevant stone discovery feeds.',
          'Verified sponsored tag on product cards.',
          '10x high-volume trade inquiry potential.'
        ],
        status: 'active',
        is_mock: true
      }
    ]);

    const listingPackages = await PromotionPackage.insertMany([
      {
        promotion_type: 'listing',
        package_name: 'Starter Top Rank',
        description: 'Guaranteed Top 5 placement in eligible directory searches with Featured Supplier badge.',
        price: 499,
        duration_days: 7,
        promotional_multiplier: 'Guaranteed Top 5',
        badge_label: 'Featured Supplier',
        theme_color: 'orange',
        display_order: 1,
        benefits: [
          'Guaranteed Top 5 placement in eligible directory searches.',
          'Featured Supplier profile badge.',
          'Increased profile visibility.',
          'Direct WhatsApp link.'
        ],
        status: 'active',
        is_mock: true
      },
      {
        promotion_type: 'listing',
        package_name: 'Diamond Visibility',
        description: 'Guaranteed Top 3 placement in eligible directory searches with direct Call/Inquiry priority.',
        price: 999,
        duration_days: 15,
        promotional_multiplier: 'Guaranteed Top 3',
        badge_label: 'Featured Supplier',
        theme_color: 'orange',
        display_order: 2,
        benefits: [
          'Guaranteed Top 3 placement in eligible directory searches.',
          'Premium profile visibility badge.',
          'Direct Call and Inquiry priority buttons.',
          'Increased buyer inquiries and phone calls.'
        ],
        status: 'active',
        is_mock: true
      },
      {
        promotion_type: 'listing',
        package_name: 'State Dominance',
        description: 'Priority placement across selected target districts with homepage supplier spotlight.',
        price: 1799,
        duration_days: 30,
        promotional_multiplier: 'State Spotlight',
        badge_label: 'Featured Supplier',
        theme_color: 'orange',
        display_order: 3,
        benefits: [
          'Priority placement across selected target districts.',
          'Premium sponsored badge.',
          'Homepage featured supplier spotlight eligibility.',
          'Maximum visibility and lead generation opportunities.'
        ],
        status: 'active',
        is_mock: true
      }
    ]);
    console.log(`Created 3 Feed Packages and 3 Listing Boost Packages.`);

    const mfg1Profile = createdBusinesses[2];
    const mfg1Products = await Product.find({ businessProfileId: mfg1Profile._id });
    const targetProduct = mfg1Products[0] || (await Product.findOne({ name: /Steel Grey/ }));

    if (mfg1Profile && targetProduct) {
      const feedPkg = feedPackages[1];
      const feedGst = 179.82;
      const feedTotal = 1178.82;

      const startDateFeed = new Date();
      const endDateFeed = new Date(Date.now() + 15 * 86400000);

      const campaignFeed = await PromotionCampaign.create({
        campaign_id: 'CMP-2026-F001',
        manufacturer_id: mfg1Profile._id,
        userId: uMfg1._id,
        product_id: targetProduct._id,
        package_id: feedPkg._id,
        campaign_type: 'feed',
        campaign_name: 'Steel Grey Granite Discovery Feed Blast',
        campaign_status: 'active',
        duration_days: 15,
        start_date: startDateFeed,
        end_date: endDateFeed,
        target_type: 'states',
        targeting_configuration: {
          all_india: false,
          states: ['Rajasthan', 'Gujarat', 'Maharashtra'],
          districts: ['Jaipur', 'Kishangarh', 'Ahmedabad', 'Mumbai']
        },
        subtotal: 999,
        gst_rate: 18,
        gst_amount: feedGst,
        total_amount: feedTotal,
        daily_budget: 67,
        priority_score: 20,
        impressions_count: 3420,
        clicks_count: 245,
        inquiries_count: 38,
        quote_requests_count: 14,
        whatsapp_clicks_count: 52,
        call_clicks_count: 29,
        is_mock: true
      });

      await Product.findByIdAndUpdate(targetProduct._id, {
        is_promoted: true,
        active_promotion_id: campaignFeed._id,
        promotion_priority: 20
      });

      const orderFeed = await PromotionOrder.create({
        order_number: 'ORD-PRM-2026-001',
        campaign_id: campaignFeed._id,
        manufacturer_id: mfg1Profile._id,
        userId: uMfg1._id,
        package_id: feedPkg._id,
        subtotal: 999,
        gst_rate: 18,
        gst_amount: feedGst,
        total_amount: feedTotal,
        order_status: 'completed',
        payment_gateway: 'razorpay',
        gateway_order_id: 'order_mock_growth_feed_01',
        is_mock: true
      });

      const paymentFeed = await Payment.create({
        payment_reference: 'PAY-SMI-2026-001',
        order_id: orderFeed._id,
        campaign_id: campaignFeed._id,
        manufacturer_id: mfg1Profile._id,
        userId: uMfg1._id,
        payment_gateway: 'razorpay',
        gateway_order_id: 'order_mock_growth_feed_01',
        gateway_payment_id: 'pay_mock_feed_999',
        transaction_reference: 'pay_mock_feed_999',
        amount: feedTotal,
        payment_status: 'successful',
        payment_verified_at: new Date(),
        is_mock: true
      });

      await PromotionInvoice.create({
        invoice_number: 'INV-SMI-2026-0001',
        invoice_date: new Date(),
        manufacturer_id: mfg1Profile._id,
        userId: uMfg1._id,
        campaign_id: campaignFeed._id,
        order_id: orderFeed._id,
        payment_id: paymentFeed._id,
        seller_details: {
          company_name: 'Stone Market India Pvt. Ltd.',
          address: 'RIICO Industrial Area, Kishangarh, Rajasthan - 305801',
          gstin: '08AAAAA0000A1Z5',
          email: 'billing@stonemarketindia.com'
        },
        buyer_details: {
          company_name: mfg1Profile.company_name,
          billing_address: mfg1Profile.address?.full_address || 'Jalore Industrial Area, Rajasthan',
          state: 'Rajasthan',
          gstin: mfg1Profile.gst_number || '08AAACR1234F1Z9',
          phone: '9111111104'
        },
        promotion_type: 'feed',
        package_name: feedPkg.package_name,
        duration_days: 15,
        taxable_amount: 999,
        gst_rate: 18,
        cgst_rate: 9,
        cgst_amount: 89.91,
        sgst_rate: 9,
        sgst_amount: 89.91,
        gst_amount: 179.82,
        total_amount: feedTotal,
        payment_status: 'paid',
        transaction_reference: 'pay_mock_feed_999',
        is_mock: true
      });

      const listPkg = listingPackages[1];
      const campaignListing = await PromotionCampaign.create({
        campaign_id: 'CMP-2026-L002',
        manufacturer_id: mfg1Profile._id,
        userId: uMfg1._id,
        package_id: listPkg._id,
        campaign_type: 'listing',
        campaign_name: `${mfg1Profile.company_name} Top 3 Directory Boost`,
        campaign_status: 'active',
        duration_days: 15,
        start_date: startDateFeed,
        end_date: endDateFeed,
        target_type: 'all_india',
        targeting_configuration: { all_india: true },
        subtotal: 999,
        gst_rate: 18,
        gst_amount: 179.82,
        total_amount: 1178.82,
        daily_budget: 67,
        priority_score: 25,
        impressions_count: 5120,
        clicks_count: 410,
        inquiries_count: 56,
        quote_requests_count: 22,
        whatsapp_clicks_count: 78,
        call_clicks_count: 45,
        is_mock: true
      });

      await BusinessProfile.findByIdAndUpdate(mfg1Profile._id, {
        is_promoted: true,
        active_promotion_id: campaignListing._id,
        promotion_priority: 25,
        promoted_badge: 'Featured Supplier'
      });

      const orderList = await PromotionOrder.create({
        order_number: 'ORD-PRM-2026-002',
        campaign_id: campaignListing._id,
        manufacturer_id: mfg1Profile._id,
        userId: uMfg1._id,
        package_id: listPkg._id,
        subtotal: 999,
        gst_rate: 18,
        gst_amount: 179.82,
        total_amount: 1178.82,
        order_status: 'completed',
        payment_gateway: 'razorpay',
        gateway_order_id: 'order_mock_diamond_list_02',
        is_mock: true
      });

      const paymentList = await Payment.create({
        payment_reference: 'PAY-SMI-2026-002',
        order_id: orderList._id,
        campaign_id: campaignListing._id,
        manufacturer_id: mfg1Profile._id,
        userId: uMfg1._id,
        payment_gateway: 'razorpay',
        gateway_order_id: 'order_mock_diamond_list_02',
        gateway_payment_id: 'pay_mock_list_999',
        transaction_reference: 'pay_mock_list_999',
        amount: 1178.82,
        payment_status: 'successful',
        payment_verified_at: new Date(),
        is_mock: true
      });

      await PromotionInvoice.create({
        invoice_number: 'INV-SMI-2026-0002',
        invoice_date: new Date(),
        manufacturer_id: mfg1Profile._id,
        userId: uMfg1._id,
        campaign_id: campaignListing._id,
        order_id: orderList._id,
        payment_id: paymentList._id,
        seller_details: {
          company_name: 'Stone Market India Pvt. Ltd.',
          address: 'RIICO Industrial Area, Kishangarh, Rajasthan - 305801',
          gstin: '08AAAAA0000A1Z5',
          email: 'billing@stonemarketindia.com'
        },
        buyer_details: {
          company_name: mfg1Profile.company_name,
          billing_address: mfg1Profile.address?.full_address || 'Jalore Industrial Area, Rajasthan',
          state: 'Rajasthan',
          gstin: mfg1Profile.gst_number || '08AAACR1234F1Z9',
          phone: '9111111104'
        },
        promotion_type: 'listing',
        package_name: listPkg.package_name,
        duration_days: 15,
        taxable_amount: 999,
        gst_rate: 18,
        cgst_rate: 9,
        cgst_amount: 89.91,
        sgst_rate: 9,
        sgst_amount: 89.91,
        gst_amount: 179.82,
        total_amount: 1178.82,
        payment_status: 'paid',
        transaction_reference: 'pay_mock_list_999',
        is_mock: true
      });

      // Seed 30 days of daily analytics events for chart data
      const analyticsRows = [];
      for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const evDate = new Date();
        evDate.setDate(evDate.getDate() - (29 - dayOffset));
        evDate.setHours(12, 0, 0, 0);

        const dailyImpr = 60 + Math.floor(Math.random() * 80);
        const dailyClicks = Math.floor(dailyImpr * 0.08) + 2;
        const dailyInq = Math.floor(dailyClicks * 0.2) + 1;

        for (let i = 0; i < dailyImpr; i++) {
          analyticsRows.push({
            campaign_id: campaignFeed._id,
            event_type: 'impression',
            product_id: targetProduct._id,
            source: 'buyer_feed',
            event_date: evDate,
            is_mock: true
          });
        }
        for (let i = 0; i < dailyClicks; i++) {
          analyticsRows.push({
            campaign_id: campaignFeed._id,
            event_type: 'click',
            product_id: targetProduct._id,
            source: 'buyer_feed',
            event_date: evDate,
            is_mock: true
          });
        }
        for (let i = 0; i < dailyInq; i++) {
          analyticsRows.push({
            campaign_id: campaignFeed._id,
            event_type: 'inquiry',
            product_id: targetProduct._id,
            source: 'buyer_feed',
            event_date: evDate,
            is_mock: true
          });
        }
      }
      await PromotionAnalytics.insertMany(analyticsRows);
      console.log(`Seeded active campaigns, orders, payments, invoices, and ${analyticsRows.length} analytics events for Mfg 1.`);
    }

    // 16. Seeding Phase 3: My Inquiries & Lead Management Data
    console.log('\n16. Seeding Phase 3: My Inquiries & Lead Management Data...');
    const mfg1Prof = await BusinessProfile.findOne({ company_name: { $regex: 'Royal Rajasthan Granite', $options: 'i' } });
    const mfg2Prof = await BusinessProfile.findOne({ company_name: { $regex: 'Kishangarh Marble', $options: 'i' } });
    const buyer1User = await User.findOne({ mobile: '9111111112' });
    const buyer2User = await User.findOne({ mobile: '9111111113' });
    const buyer3User = await User.findOne({ mobile: '9111111114' });
    const blackGalaxyProd = await Product.findOne({ name: { $regex: 'Black Galaxy', $options: 'i' } });

    if (mfg1Prof && buyer1User) {
      // Inquiry 1: Quotes Received (Black Galaxy Granite Gangsaw Slabs)
      const inq1 = await Inquiry.create({
        inquiry_number: 'INQ-2026-9041',
        buyer_id: buyer1User._id,
        senderId: buyer1User._id,
        productId: blackGalaxyProd?._id,
        requirement_title: 'Black Galaxy Granite Gangsaw Slabs',
        subject: 'Black Galaxy Granite Gangsaw Slabs',
        category: 'Granite & Marble Slabs',
        description: 'Require export quality Black Galaxy granite slabs for luxury villa flooring project in Jaipur.',
        requirements: 'Polished finish, consistent golden speckles, zero hairline cracks.',
        required_quantity: 500,
        quantity: 500,
        quantity_unit: 'Sq.ft',
        unit: 'Sq.ft',
        required_size: '10 × 6 ft',
        size: '10 × 6 ft',
        thickness: '18 mm',
        finish: 'Mirror Polished',
        quality: 'Premium Grade A',
        grade: 'Grade A',
        edge_profile: 'Straight Cut',
        material: 'Granite',
        color: 'Black Galaxy',
        pattern: 'Golden Flecks',
        country_of_origin: 'India',
        delivery_location: 'Jaipur, Rajasthan',
        deliveryLocation: {
          address: 'Plot 45, Tonk Road',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302015'
        },
        contactInfo: {
          name: buyer1User.name || 'Global Infra Buildcon',
          mobile: buyer1User.mobile,
          email: buyer1User.email,
          city: 'Jaipur'
        },
        supplierType: 'manufacturer',
        assigned_manufacturers: [mfg1Prof._id, ...(mfg2Prof ? [mfg2Prof._id] : [])],
        recipients: [
          { manufacturer_id: mfg1Prof._id, delivery_status: 'delivered', viewed_at: new Date() },
          ...(mfg2Prof ? [{ manufacturer_id: mfg2Prof._id, delivery_status: 'delivered', viewed_at: new Date() }] : [])
        ],
        inquiry_status: 'quotes_received',
        status: 'quotes_received',
        quotations_count: 2,
        attachments: [
          {
            file_name: 'villa_elevation_specs.pdf',
            file_path: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
            file_type: 'application/pdf',
            file_size: 1450000
          }
        ],
        is_mock: true
      });

      // Inquiry 2: Pending Requirement (Steel Grey Granite Cut-to-Size)
      const inq2 = await Inquiry.create({
        inquiry_number: 'INQ-2026-9042',
        buyer_id: buyer2User?._id || buyer1User._id,
        senderId: buyer2User?._id || buyer1User._id,
        requirement_title: 'Steel Grey Granite Cut-to-Size',
        subject: 'Steel Grey Granite Cut-to-Size',
        category: 'Granite & Marble Slabs',
        description: 'Need Steel Grey granite cut to size for commercial office staircase.',
        required_quantity: 1200,
        quantity: 1200,
        quantity_unit: 'Sq.ft',
        unit: 'Sq.ft',
        required_size: '4 × 1 ft',
        size: '4 × 1 ft',
        thickness: '20 mm',
        finish: 'Flamed / Lapato',
        quality: 'Standard Commercial',
        material: 'Granite',
        color: 'Steel Grey',
        delivery_location: 'Udaipur, Rajasthan',
        deliveryLocation: {
          city: 'Udaipur',
          state: 'Rajasthan'
        },
        supplierType: 'manufacturer',
        assigned_manufacturers: [mfg1Prof._id],
        recipients: [{ manufacturer_id: mfg1Prof._id, delivery_status: 'delivered' }],
        inquiry_status: 'pending',
        status: 'pending',
        quotations_count: 0,
        is_mock: true
      });

      // Inquiry 3: Closed (Makrana White Marble Blocks)
      const inq3 = await Inquiry.create({
        inquiry_number: 'INQ-2026-8800',
        buyer_id: buyer3User?._id || buyer1User._id,
        senderId: buyer3User?._id || buyer1User._id,
        requirement_title: 'Makrana White Marble Blocks',
        category: 'Granite & Marble Slabs',
        required_quantity: 80,
        quantity: 80,
        quantity_unit: 'Tons',
        delivery_location: 'Makrana, Rajasthan',
        supplierType: 'manufacturer',
        assigned_manufacturers: [mfg1Prof._id],
        inquiry_status: 'closed',
        status: 'closed',
        closed_at: new Date(Date.now() - 3 * 86400000),
        closure_reason: 'Requirement finalized with offline supplier',
        closure_comments: 'Project schedule moved earlier, material procured locally.',
        is_mock: true
      });

      // Quotation 1 by Mfg 1 on Inquiry 1
      const quote1 = await InquiryQuotation.create({
        quote_number: 'QTE-2026-9041-A',
        inquiry_id: inq1._id,
        manufacturer_id: mfg1Prof._id,
        manufacturer_user_id: mfg1Prof.userId,
        buyer_id: buyer1User._id,
        product_id: blackGalaxyProd?._id,
        quoted_quantity: 500,
        quantity_unit: 'Sq.ft',
        unit_price: 175,
        subtotal: 87500,
        tax_rate: 18,
        tax_amount: 15570,
        shipping_charges: 4500,
        discount: 1000,
        total_amount: 106570,
        material: 'Granite',
        size: '10 × 6 ft',
        thickness: '18 mm',
        finish: 'Mirror Polished',
        quality: 'Export Quality Grade A',
        delivery_timeline: '7-10 Business Days',
        payment_terms: '50% Advance, 50% on Dispatch',
        advance_payment: 53285,
        balance_payment: 53285,
        validity_date: new Date(Date.now() + 15 * 86400000),
        warranty: '1 Year Quality Guarantee',
        quote_status: 'submitted',
        notes: 'Premium export Gangsaw cut Black Galaxy slabs from Jalore facility.',
        is_mock: true
      });

      // Quotation 2 by Mfg 2 on Inquiry 1 (Competing Quotation)
      if (mfg2Prof) {
        await InquiryQuotation.create({
          quote_number: 'QTE-2026-9041-B',
          inquiry_id: inq1._id,
          manufacturer_id: mfg2Prof._id,
          manufacturer_user_id: mfg2Prof.userId,
          buyer_id: buyer1User._id,
          quoted_quantity: 500,
          quantity_unit: 'Sq.ft',
          unit_price: 180,
          subtotal: 90000,
          tax_rate: 18,
          tax_amount: 16200,
          shipping_charges: 3000,
          discount: 0,
          total_amount: 109200,
          material: 'Granite',
          size: '10 × 6 ft',
          thickness: '18 mm',
          finish: 'High Gloss Polish',
          quality: 'First Choice Quality',
          delivery_timeline: '5-7 Days',
          payment_terms: '100% on Dispatch',
          advance_payment: 0,
          balance_payment: 109200,
          validity_date: new Date(Date.now() + 20 * 86400000),
          warranty: 'Standard Crack & Polish Warranty',
          quote_status: 'submitted',
          notes: 'Freshly cut Gangsaw stock available for inspection at Kishangarh unit.',
          is_mock: true
        });
      }

      // Activity logs for Inquiry 1
      await InquiryActivityLog.create([
        {
          inquiry_id: inq1._id,
          performed_by: buyer1User._id,
          actor_type: 'buyer',
          activity_type: 'inquiry_created',
          stage: 1,
          title: 'Inquiry Requested',
          description: 'Buyer submitted new requirement inquiry INQ-2026-9041.'
        },
        {
          inquiry_id: inq1._id,
          performed_by: mfg1Prof.userId,
          actor_type: 'manufacturer',
          activity_type: 'inquiry_reviewed',
          stage: 2,
          title: 'Requirement Placed Under Review',
          description: `${mfg1Prof.company_name} placed the inquiry under technical review.`
        },
        {
          inquiry_id: inq1._id,
          performed_by: mfg1Prof.userId,
          actor_type: 'manufacturer',
          activity_type: 'quote_submitted',
          stage: 3,
          title: 'Quotation Submitted',
          description: `${mfg1Prof.company_name} submitted quotation QTE-2026-9041-A at ₹175/Sq.ft (Total: ₹1,06,570).`,
          metadata: { quote_id: quote1._id, quote_number: 'QTE-2026-9041-A', total_amount: 106570 }
        }
      ]);

      // Seed chat messages
      await InquiryMessage.create([
        {
          inquiry_id: inq1._id,
          quotation_id: quote1._id,
          sender_id: mfg1Prof.userId,
          sender_type: 'manufacturer',
          receiver_id: buyer1User._id,
          message: 'Hello Ramesh, we have ready stock of 10x6 ft Black Galaxy slabs at our Jalore unit. Let us know if you need physical sample dispatch.',
          is_read: true,
          is_mock: true
        },
        {
          inquiry_id: inq1._id,
          quotation_id: quote1._id,
          sender_id: buyer1User._id,
          sender_type: 'buyer',
          receiver_id: mfg1Prof.userId,
          message: 'Thank you Vikram! Can you confirm if wooden crate export packaging is included in the quoted freight?',
          is_read: false,
          is_mock: true
        }
      ]);

      console.log('Seeded Phase 3 Inquiries (INQ-2026-9041, INQ-2026-9042, INQ-2026-8800), Quotations, Activity Logs, and Messages.');
    }

    // ==========================================
    // 18. SEED PHASE 4: LEADS, NOTES, ACCOUNT SETTINGS & PREFERENCES
    // ==========================================
    console.log('--- 18. Seeding Phase 4 Leads & Account Settings ---');
    const mfgProf1 = await BusinessProfile.findOne({ business_type: 'manufacturer', is_mock: true });
    const buyerProf1 = await User.findOne({ role: 'buyer', is_mock: true });
    const buyerCust1 = await User.findOne({ role: 'customer', is_mock: true });

    if (mfgProf1) {
      // 1. Notification Preferences
      await NotificationPreference.findOneAndUpdate(
        { user_id: mfgProf1.userId },
        {
          user_id: mfgProf1.userId,
          new_inquiry: true,
          lead_messages: true,
          quote_requests: true,
          ad_performance: true,
          subscription_billing: true,
          marketing_emails: false,
          channels: { in_app: true, push: true, email: true, sms: false }
        },
        { upsert: true, new: true }
      );

      // 2. Quiet Hours (10:00 PM – 8:00 AM)
      await QuietHours.findOneAndUpdate(
        { user_id: mfgProf1.userId },
        {
          user_id: mfgProf1.userId,
          enabled: true,
          start_time: '22:00',
          end_time: '08:00',
          timezone: 'Asia/Kolkata'
        },
        { upsert: true, new: true }
      );

      // 3. User Preferences (Language: English, Appearance: System)
      await UserPreferences.findOneAndUpdate(
        { user_id: mfgProf1.userId },
        {
          user_id: mfgProf1.userId,
          language: 'en',
          appearance: 'system',
          timezone: 'Asia/Kolkata'
        },
        { upsert: true, new: true }
      );

      // 4. Active Sessions for Manufacturer
      await UserSession.create([
        {
          userId: mfgProf1.userId,
          session_id: 'mfg_sess_mobile_01',
          device_name: 'Samsung Galaxy S24 Ultra (Android 14)',
          device_type: 'mobile',
          ip_address: '103.212.144.15',
          location: 'Jalore, Rajasthan, India',
          last_active: new Date(),
          is_active: true,
          is_mock: true
        },
        {
          userId: mfgProf1.userId,
          session_id: 'mfg_sess_desktop_02',
          device_name: 'MacBook Pro 16" (macOS Sequoia)',
          device_type: 'desktop',
          ip_address: '103.212.144.18',
          location: 'Jaipur, Rajasthan, India',
          last_active: new Date(Date.now() - 3600000),
          is_active: true,
          is_mock: true
        }
      ]);

      // 5. Seed Leads linked to Inquiries
      const existingInqs = await Inquiry.find({ is_mock: true }).limit(5);
      if (existingInqs.length > 0) {
        // Lead 1: #LD12345 (New)
        const lead1 = await Lead.create({
          lead_number: '#LD12345',
          inquiry_id: existingInqs[0]._id,
          buyer_id: buyerCust1?._id || buyerProf1?._id,
          manufacturer_id: mfgProf1._id,
          lead_status: 'new',
          priority: 'urgent',
          urgency: 'within_15_days',
          usage_application: 'Flooring',
          budget_min: 250000,
          budget_max: 350000,
          currency: 'INR',
          budget_type: 'estimated',
          assigned_at: new Date(Date.now() - 120000), // 2 mins ago
          share_token: 'share_ld12345_token',
          is_mock: true
        });

        // Activity Log for Lead 1
        await LeadActivityLog.create([
          {
            lead_id: lead1._id,
            actor_id: buyerCust1?._id,
            actor_type: 'buyer',
            event_type: 'lead_received',
            previous_status: null,
            new_status: 'new',
            title: 'Lead Received',
            description: 'Requirement lead received from Vikram Rathore for 500 Sq.ft Black Galaxy Granite.'
          },
          {
            lead_id: lead1._id,
            actor_id: mfgProf1.userId,
            actor_type: 'manufacturer',
            event_type: 'lead_viewed',
            previous_status: 'new',
            new_status: 'new',
            title: 'Lead Viewed',
            description: 'Manufacturer opened and reviewed lead specifications.'
          }
        ]);

        // Private Internal Notes on Lead 1
        await LeadNote.create([
          {
            lead_id: lead1._id,
            manufacturer_id: mfgProf1._id,
            author_id: mfgProf1.userId,
            note: 'Buyer requested premium material samples with dense gold specks before finalizing gangsaw slabs.',
            is_mock: true
          },
          {
            lead_id: lead1._id,
            manufacturer_id: mfgProf1._id,
            author_id: mfgProf1.userId,
            note: 'Checked yard stock: 2,400 sq.ft mirror polished 20mm slabs available for immediate dispatch.',
            is_mock: true
          }
        ]);

        // Lead 2: #LD12346 (In Discussion)
        if (existingInqs[1]) {
          const lead2 = await Lead.create({
            lead_number: '#LD12346',
            inquiry_id: existingInqs[1]._id,
            buyer_id: buyerProf1?._id,
            manufacturer_id: mfgProf1._id,
            lead_status: 'in_discussion',
            priority: 'high',
            urgency: 'immediate',
            usage_application: 'Wall Cladding',
            budget_min: 1800000,
            budget_max: 2500000,
            currency: 'INR',
            budget_type: 'estimated',
            assigned_at: new Date(Date.now() - 86400000),
            share_token: 'share_ld12346_token',
            is_mock: true
          });

          await LeadNote.create({
            lead_id: lead2._id,
            manufacturer_id: mfgProf1._id,
            author_id: mfgProf1.userId,
            note: 'Architect site visit scheduled for next Tuesday at Kishangarh processing plant.',
            is_mock: true
          });

          await LeadActivityLog.create({
            lead_id: lead2._id,
            actor_id: mfgProf1.userId,
            actor_type: 'manufacturer',
            event_type: 'lead_marked_in_discussion',
            previous_status: 'new',
            new_status: 'in_discussion',
            title: 'Moved to In Discussion',
            description: 'Manufacturer initiated technical discussion with buyer.'
          });
        }

        // Lead 3: #LD12347 (Quote Sent)
        if (existingInqs[2]) {
          await Lead.create({
            lead_number: '#LD12347',
            inquiry_id: existingInqs[2]._id,
            buyer_id: buyerProf1?._id,
            manufacturer_id: mfgProf1._id,
            lead_status: 'quote_sent',
            priority: 'normal',
            urgency: 'within_30_days',
            usage_application: 'Commercial Flooring',
            budget_min: 1500000,
            budget_max: 2000000,
            currency: 'INR',
            budget_type: 'estimated',
            assigned_at: new Date(Date.now() - 172800000),
            share_token: 'share_ld12347_token',
            is_mock: true
          });
        }

        // Lead 4: #LD12348 (Converted)
        await Lead.create({
          lead_number: '#LD12348',
          inquiry_id: existingInqs[0]._id,
          buyer_id: buyerProf1?._id,
          manufacturer_id: mfgProf1._id,
          lead_status: 'converted',
          priority: 'high',
          urgency: 'immediate',
          usage_application: 'Villa Construction',
          budget_min: 800000,
          budget_max: 1200000,
          currency: 'INR',
          converted_at: new Date(Date.now() - 3600000),
          share_token: 'share_ld12348_token',
          is_mock: true
        });

        // Lead 5: #LD12349 (Closed)
        await Lead.create({
          lead_number: '#LD12349',
          inquiry_id: existingInqs[0]._id,
          buyer_id: buyerProf1?._id,
          manufacturer_id: mfgProf1._id,
          lead_status: 'closed',
          priority: 'normal',
          urgency: 'flexible',
          closure_reason: 'Buyer purchased locally',
          closure_comments: 'Project started ahead of planned delivery date.',
          closed_at: new Date(Date.now() - 7200000),
          share_token: 'share_ld12349_token',
          is_mock: true
        });
      }
      console.log('Seeded Phase 4 Leads (#LD12345 to #LD12349), Notes, Activity Logs, Notification Preferences, Quiet Hours, and User Preferences.');
    }

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
