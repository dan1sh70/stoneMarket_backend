require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Vendor = require('../src/models/Vendor');
const Lead = require('../src/models/Lead');
const Inquiry = require('../src/models/Inquiry');
const Advertisement = require('../src/models/Advertisement');
const SupportTicket = require('../src/models/SupportTicket');
const Location = require('../src/models/Location');
const GraniteColor = require('../src/models/GraniteColor');
const MeasurementUnit = require('../src/models/MeasurementUnit');

const mongoUri = process.env.MONGO_URI || 'mongodb://root:Xs7JNmryPfFeI9L9bMz3hzcGSmrf6UFU95j69CMfp1E5xPRcKgnXgNriZW1zFIwn@200.97.172.161:2481/test?authSource=admin&directConnection=true';

async function seedRealData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const adminHash = await bcrypt.hash('admin123', 10);
    const passHash = await bcrypt.hash('StoneMarket@2026', 10);

    // 1. Upsert Super Admin
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@mockstonemarket.com',
        mobile: '9999999999',
        password: adminHash,
        role: 'admin',
        status: 'active',
        isVerified: true
      });
    } else {
      admin.name = 'Super Admin';
      admin.email = 'admin@mockstonemarket.com';
      admin.password = adminHash;
      admin.status = 'active';
      admin.isVerified = true;
      await admin.save();
    }
    console.log('Admin user verified:', admin.email);

    // 2. Clear out demo non-admin businesses and demo non-admin users
    await BusinessProfile.deleteMany({});
    await Product.deleteMany({});
    await Vendor.deleteMany({});
    await Lead.deleteMany({});
    await Inquiry.deleteMany({});
    await Advertisement.deleteMany({});
    await SupportTicket.deleteMany({});
    await User.deleteMany({ _id: { $ne: admin._id } });

    console.log('Cleared out old demo data');

    // 3. Real Indian Stone Industry Businesses & Owners
    const realBusinessData = [
      {
        user: {
          name: 'Rajendra Singh Shekhawat',
          email: 'rajendra@marwarminerals.com',
          mobile: '9829014210',
          role: 'mining',
          status: 'active',
          isVerified: true,
          password: passHash
        },
        business: {
          company_name: 'Marwar Mining & Granites Corp',
          business_type: 'mining',
          established_year: 2008,
          factory_type: 'owned',
          monthly_capacity: 120000,
          capacity_unit: 'Sq.Ft',
          rating: 4.9,
          review_count: 38,
          status: 'active',
          verification_status: 'approved',
          is_verified: true,
          is_promoted: true,
          promoted_badge: 'Verified Quarry Operator',
          ec_clearance_status: 'Clearance Granted (MoEF&CC)',
          address: {
            address_line: 'Khasra No. 412/3, RIICO Industrial Phase III',
            area: 'Jalore Industrial Area',
            city: 'Jalore',
            district: 'Jalore',
            state: 'Rajasthan',
            pincode: '343001',
            country: 'India'
          },
          owners: [
            { name: 'Rajendra Singh Shekhawat', phone: '9829014210', email: 'rajendra@marwarminerals.com', isPrimary: true }
          ]
        }
      },
      {
        user: {
          name: 'Venkata Narayana Reddy',
          email: 'v.reddy@deccangranites.com',
          mobile: '9440158821',
          role: 'manufacturer',
          status: 'active',
          isVerified: true,
          password: passHash
        },
        business: {
          company_name: 'Deccan Gangsaw & Slab Processing Mills',
          business_type: 'manufacturer',
          established_year: 2012,
          factory_type: 'owned',
          monthly_capacity: 180000,
          capacity_unit: 'Sq.Ft',
          rating: 4.8,
          review_count: 52,
          status: 'active',
          verification_status: 'approved',
          is_verified: true,
          is_promoted: true,
          promoted_badge: 'Top Export Unit',
          address: {
            address_line: 'Plot 18 & 19, Growth Centre, Chimakurthy Road',
            area: 'Ongole SEZ',
            city: 'Ongole',
            district: 'Prakasam',
            state: 'Andhra Pradesh',
            pincode: '523001',
            country: 'India'
          },
          owners: [
            { name: 'V. Narayana Reddy', phone: '9440158821', email: 'v.reddy@deccangranites.com', isPrimary: true }
          ]
        }
      },
      {
        user: {
          name: 'Vikramaditya Mehta',
          email: 'vikram@shreekrishnamarble.in',
          mobile: '9825061902',
          role: 'showroom',
          status: 'active',
          isVerified: true,
          password: passHash
        },
        business: {
          company_name: 'Shree Krishna Natural Stone Experience Centre',
          business_type: 'showroom',
          established_year: 2015,
          showroom_type: 'Luxury Boutique & Godown',
          monthly_capacity: 65000,
          capacity_unit: 'Sq.Ft',
          rating: 4.7,
          review_count: 24,
          status: 'active',
          verification_status: 'approved',
          is_verified: true,
          address: {
            address_line: 'NH-8 Bypass, Near Transport Nagar',
            area: 'Sukher Marble Mandi',
            city: 'Udaipur',
            district: 'Udaipur',
            state: 'Rajasthan',
            pincode: '313001',
            country: 'India'
          },
          owners: [
            { name: 'Vikramaditya Mehta', phone: '9825061902', email: 'vikram@shreekrishnamarble.in', isPrimary: true }
          ]
        }
      },
      {
        user: {
          name: 'Kishore Jhalani',
          email: 'kishore@rajasthanstonetraders.com',
          mobile: '9414023456',
          role: 'trader',
          status: 'active',
          isVerified: true,
          password: passHash
        },
        business: {
          company_name: 'Jhalani Stone Trading & Distribution House',
          business_type: 'trader',
          established_year: 2005,
          rating: 4.6,
          review_count: 19,
          status: 'active',
          verification_status: 'pending',
          is_verified: false,
          address: {
            address_line: 'G-12, Marble Market Complex',
            area: 'Kishangarh Mandi',
            city: 'Kishangarh',
            district: 'Ajmer',
            state: 'Rajasthan',
            pincode: '305801',
            country: 'India'
          },
          owners: [
            { name: 'Kishore Jhalani', phone: '9414023456', email: 'kishore@rajasthanstonetraders.com', isPrimary: true }
          ]
        }
      },
      {
        user: {
          name: 'Sunil Kumar Agrawal',
          email: 'procurement@infrabuildsourcing.com',
          mobile: '9810034567',
          role: 'buyer',
          status: 'active',
          isVerified: true,
          password: passHash
        },
        business: {
          company_name: 'Apex Infrastructure & Metro Builders Procurement',
          business_type: 'buyer',
          established_year: 2011,
          annual_purchasing_volume: 500000,
          purchasing_volume_unit: 'Sq.ft',
          sourcing_scope: 'Domestic',
          rating: 4.9,
          review_count: 15,
          status: 'active',
          verification_status: 'approved',
          is_verified: true,
          address: {
            address_line: 'Tower B, 7th Floor, DLF Cyber Park',
            area: 'Phase 3, Sector 20',
            city: 'Gurugram',
            district: 'Gurugram',
            state: 'Haryana',
            pincode: '122002',
            country: 'India'
          },
          owners: [
            { name: 'Sunil Kumar Agrawal', phone: '9810034567', email: 'procurement@infrabuildsourcing.com', isPrimary: true }
          ]
        }
      },
      {
        user: {
          name: 'Gurpreet Singh Mann',
          email: 'dispatch@mannheavyhaulage.com',
          mobile: '9872045678',
          role: 'transport_national',
          status: 'active',
          isVerified: true,
          password: passHash
        },
        business: {
          company_name: 'Mann Heavy Freight & Multi-Axle Logistics',
          business_type: 'transport_national',
          established_year: 2014,
          dispatch_timings: '24x7 Hydraulic & Trailer Support',
          has_all_india_permit: true,
          has_national_coverage: true,
          rating: 4.8,
          review_count: 41,
          status: 'active',
          verification_status: 'approved',
          is_verified: true,
          address: {
            address_line: 'Logistics Park, Ring Road Toll Plaza',
            area: 'VKI Area',
            city: 'Jaipur',
            district: 'Jaipur',
            state: 'Rajasthan',
            pincode: '302013',
            country: 'India'
          },
          owners: [
            { name: 'Gurpreet Singh Mann', phone: '9872045678', email: 'dispatch@mannheavyhaulage.com', isPrimary: true }
          ]
        }
      },
      {
        user: {
          name: 'Pawan Khandelwal',
          email: 'pawan@makranamachinery.in',
          mobile: '9828067890',
          role: 'diamond_blades',
          status: 'active',
          isVerified: true,
          password: passHash
        },
        business: {
          company_name: 'Makrana Diamond Tools & Gangsaw Engineering',
          business_type: 'diamond_blades',
          established_year: 2016,
          daily_brazing_capacity: '200 Blades / Day',
          blade_size_coverage: '14" – 84" Diamond Blades',
          rating: 4.7,
          review_count: 14,
          status: 'active',
          verification_status: 'pending',
          is_verified: false,
          address: {
            address_line: 'Bye-pass Road, Industrial Area Phase II',
            area: 'Makrana Mandi',
            city: 'Makrana',
            district: 'Nagaur',
            state: 'Rajasthan',
            pincode: '341505',
            country: 'India'
          },
          owners: [
            { name: 'Pawan Khandelwal', phone: '9828067890', email: 'pawan@makranamachinery.in', isPrimary: true }
          ]
        }
      },
      {
        user: {
          name: 'Manish Chordia',
          email: 'manish@chordiacranes.com',
          mobile: '9414156789',
          role: 'hydro_crane',
          status: 'active',
          isVerified: true,
          password: passHash
        },
        business: {
          company_name: 'Chordia Hydro Cranes & Heavy Quarry Rigging',
          business_type: 'hydro_crane',
          established_year: 2017,
          max_lifting_capacity_tonnes: 80,
          crane_fleet_count: 14,
          rating: 4.9,
          review_count: 27,
          status: 'active',
          verification_status: 'approved',
          is_verified: true,
          address: {
            address_line: 'Plot 44, Quarry Equipment Zone',
            area: 'Bhagwanpura Industrial Area',
            city: 'Jalore',
            district: 'Jalore',
            state: 'Rajasthan',
            pincode: '343001',
            country: 'India'
          },
          owners: [
            { name: 'Manish Chordia', phone: '9414156789', email: 'manish@chordiacranes.com', isPrimary: true }
          ]
        }
      }
    ];

    const insertedBusinesses = [];
    const insertedVendors = [];

    for (const item of realBusinessData) {
      const u = await User.create(item.user);
      const bDoc = {
        ...item.business,
        userId: u._id
      };
      const b = await BusinessProfile.create(bDoc);
      insertedBusinesses.push(b);

      const slugName = b.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4);
      const v = await Vendor.create({
        userId: u._id,
        businessName: b.company_name,
        slug: slugName,
        category: b.business_type === 'mining' ? 'Mining' :
                  b.business_type === 'manufacturer' ? 'Granite Manufacturer' :
                  b.business_type === 'showroom' ? 'Showroom' :
                  b.business_type === 'trader' ? 'Traders & Suppliers' :
                  b.business_type.includes('transport') ? 'Transporters' : 'Industrial Services',
        phone: u.mobile,
        email: u.email,
        status: 'active',
        address: {
          city: b.address.city,
          state: b.address.state,
          country: 'India'
        }
      });
      insertedVendors.push(v);
    }

    console.log(`Successfully created ${insertedBusinesses.length} Authentic Indian Stone Businesses and Vendors`);

    // 4. Seed Real Authentic Products mapped to the real vendors
    const deccanVendor = insertedVendors.find(v => v.businessName.includes('Deccan'));
    const marwarVendor = insertedVendors.find(v => v.businessName.includes('Marwar'));
    const makranaVendor = insertedVendors.find(v => v.businessName.includes('Makrana'));

    const realProducts = [
      {
        vendorId: deccanVendor._id,
        businessProfileId: insertedBusinesses.find(b => b.company_name.includes('Deccan'))._id,
        business_type: 'manufacturer',
        name: 'Black Galaxy Premium Gangsaw Granite Slabs',
        description: 'World-renowned black granite with sparkling golden bronzite inclusions. Cut on Italian Breton multi-wire gangsaws, mirror-gloss epoxy resin coated, calibrated 18mm thickness.',
        category: 'Granite',
        subcategory: 'Gangsaw Slabs',
        priceRange: { min: 185, max: 245, unit: 'sqft', visible: true },
        graniteColors: ['Black Galaxy', 'Jet Black'],
        miningLocation: 'Chimakurthy, Prakasam Dist, Andhra Pradesh',
        stock_status: 'in_stock',
        sku: 'BG-EXP-18MM',
        brand_name: 'Deccan Granites',
        material_grade: 'Zero-Defect First Quality Export',
        images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800']
      },
      {
        vendorId: marwarVendor._id,
        businessProfileId: insertedBusinesses.find(b => b.company_name.includes('Marwar'))._id,
        business_type: 'mining',
        name: 'Classic Tan Brown Rough Granite Quarry Blocks',
        description: 'Direct quarry-extracted raw dressing blocks of Tan Brown granite with distinct circular feldspar pattern. Available in 8 to 22 metric ton block sizes with high yield factor.',
        category: 'Granite',
        subcategory: 'Mining Blocks',
        priceRange: { min: 95, max: 140, unit: 'sqft', visible: true },
        graniteColors: ['Tan Brown', 'Chestnut Brown'],
        miningLocation: 'Karimnagar Belt, Telangana',
        stock_status: 'in_stock',
        sku: 'TB-BLK-2026',
        brand_name: 'Marwar Quarries',
        material_grade: 'Sound Quarry Dressing Block',
        images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800']
      },
      {
        vendorId: deccanVendor._id,
        businessProfileId: insertedBusinesses.find(b => b.company_name.includes('Deccan'))._id,
        business_type: 'manufacturer',
        name: 'Kashmir White High-Polish Countertop Slabs',
        description: 'Pristine white granitic groundmass sprinkled with ruby garnets and faint grey streams. Vacuum resin treated for zero porosity and maximum stain resistance.',
        category: 'Granite',
        subcategory: 'Kitchen Countertops',
        priceRange: { min: 145, max: 210, unit: 'sqft', visible: true },
        graniteColors: ['Kashmir White', 'White'],
        miningLocation: 'Melur, Madurai, Tamil Nadu',
        stock_status: 'in_stock',
        sku: 'KW-POL-20MM',
        brand_name: 'Deccan Granites',
        material_grade: 'Premium Architectural Grade',
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']
      },
      {
        vendorId: marwarVendor._id,
        businessProfileId: insertedBusinesses.find(b => b.company_name.includes('Marwar'))._id,
        business_type: 'mining',
        name: 'Absolute Jet Black Indian Granite (Zero Pinhole)',
        description: 'Super-dense crystalline basaltic black granite with deep pitch darkness, zero grain variance, and ultra-high Mohs hardness. Cut to custom export specifications.',
        category: 'Granite',
        subcategory: 'Cut to Size Slabs',
        priceRange: { min: 220, max: 310, unit: 'sqft', visible: true },
        graniteColors: ['Absolute Black', 'Jet Black'],
        miningLocation: 'Chamrajnagar, Karnataka',
        stock_status: 'in_stock',
        sku: 'AB-MON-30MM',
        brand_name: 'Marwar Quarries',
        material_grade: 'First Choice Export Monumental',
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800']
      },
      {
        vendorId: deccanVendor._id,
        businessProfileId: insertedBusinesses.find(b => b.company_name.includes('Deccan'))._id,
        business_type: 'manufacturer',
        name: 'Imperial Red Gangsaw Slabs & Step Tiles',
        description: 'Royal ruby red Indian granite renowned worldwide for monumental facades, luxury entrance steps, and flooring. Highly durable against all weather conditions.',
        category: 'Granite',
        subcategory: 'Flooring Slabs',
        priceRange: { min: 115, max: 175, unit: 'sqft', visible: true },
        graniteColors: ['Imperial Red', 'Ruby Red'],
        miningLocation: 'Chhatarpur & Siwana Belt, Rajasthan',
        stock_status: 'in_stock',
        sku: 'IR-GANG-18MM',
        brand_name: 'Deccan Granites',
        material_grade: 'Commercial Prime',
        images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800']
      },
      {
        vendorId: makranaVendor._id,
        businessProfileId: insertedBusinesses.find(b => b.company_name.includes('Makrana'))._id,
        business_type: 'diamond_blades',
        name: 'Multi-Cutter Diamond Segments for Hard Granite (3.5m / 3.0m)',
        description: 'High-cobalt bond diamond segments infused with De Beers synthetic diamonds for rapid cutting and extended blade lifespan on tough Indian granite varieties.',
        category: 'Blades & Segments',
        subcategory: 'Multi-Blade Gangsaws',
        priceRange: { min: 45, max: 65, unit: 'pcs', visible: true },
        stock_status: 'in_stock',
        sku: 'DS-MAK-3500',
        brand_name: 'Makrana Tools',
        material_grade: 'Cobalt-Tungsten Matrix',
        images: ['https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800']
      }
    ];

    await Product.insertMany(realProducts);
    console.log(`Seeded ${realProducts.length} Authentically Described Stone Market Products`);

    // 5. Seed Real Inquiries & Leads
    const deccanBusiness = insertedBusinesses.find(b => b.company_name.includes('Deccan'));
    const marwarBusiness = insertedBusinesses.find(b => b.company_name.includes('Marwar'));
    const apexBuyer = insertedBusinesses.find(b => b.company_name.includes('Apex'));
    const deccanProduct = realProducts[0];

    const inquiry1 = await Inquiry.create({
      senderId: apexBuyer.userId,
      businessId: deccanBusiness._id,
      buyerId: apexBuyer._id,
      category: 'Granite Manufacturer',
      subject: 'Bulk Gangsaw Slab Sourcing - Sobha Horizon Project',
      message: 'Need 45,000 sq.ft of 20mm Black Galaxy polished granite for luxury Bangalore villa project.',
      requirements: '45,000 sq.ft Black Galaxy Gangsaw Calibrated 20mm',
      quantity: 45000,
      unit: 'sqft',
      thickness: '20mm',
      finish: 'Mirror Polished',
      deliveryLocation: { city: 'Bengaluru', state: 'Karnataka' },
      status: 'pending'
    });

    const inquiry2 = await Inquiry.create({
      senderId: apexBuyer.userId,
      businessId: marwarBusiness._id,
      buyerId: apexBuyer._id,
      category: 'Mining',
      subject: 'Direct Quarry Block Sourcing - Tan Brown',
      message: 'Looking for 12 rough blocks of Tan Brown granite directly at Jalore quarry site.',
      requirements: '12 Rough blocks, min 15 metric tonnes each',
      quantity: 12,
      unit: 'piece',
      finish: 'Raw Block',
      deliveryLocation: { city: 'Kishangarh', state: 'Rajasthan' },
      status: 'pending'
    });

    const realLeads = [
      {
        lead_number: 'LEAD-2026-001',
        inquiry_id: inquiry1._id,
        buyer_id: apexBuyer.userId,
        buyer_business_id: apexBuyer._id,
        manufacturer_id: deccanBusiness._id,
        lead_status: 'in_discussion',
        priority: 'high',
        urgency: 'within_30_days',
        usage_application: 'Flooring & Wall Cladding',
        estimated_value: 8250000
      },
      {
        lead_number: 'LEAD-2026-002',
        inquiry_id: inquiry2._id,
        buyer_id: apexBuyer.userId,
        buyer_business_id: apexBuyer._id,
        manufacturer_id: marwarBusiness._id,
        lead_status: 'new',
        priority: 'urgent',
        urgency: 'immediate',
        usage_application: 'Block Export',
        estimated_value: 3400000
      }
    ];

    await Lead.insertMany(realLeads);
    console.log(`Seeded ${realLeads.length} Real Inquiries and Commercial Sourcing Leads`);

    // 6. Seed Support Tickets
    const realTickets = [
      {
        userId: insertedBusinesses[0].userId,
        ticket_number: 'TCK-2026-1042',
        subject: 'Request for Quarry Environmental Clearance Document Re-audit',
        description: 'We have renewed our state pollution control board and MoEF clearance certificate for 2026-2029 and need our verified badge updated.',
        category: 'Account & Security',
        priority: 'medium',
        status: 'in_progress',
        created_by_role: 'vendor'
      },
      {
        userId: insertedBusinesses[3].userId,
        ticket_number: 'TCK-2026-1048',
        subject: 'Assistance required setting up Multi-Axle Trailer Freight Rates',
        description: 'Need help updating regional freight calculator for Jalore to Mundra Port route.',
        category: 'Orders & Delivery',
        priority: 'low',
        status: 'open',
        created_by_role: 'vendor'
      }
    ];

    await SupportTicket.insertMany(realTickets);
    console.log(`Seeded ${realTickets.length} Support Tickets`);

    // 7. Seed Real Advertisements
    const realAds = [
      {
        vendorId: deccanVendor._id,
        title: 'Deccan Gangsaw Black Galaxy Export Promotion',
        adType: 'home_banner',
        imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200',
        targetUrl: '/businesses',
        status: 'active',
        priority: 1,
        impressions: 12450,
        clicks: 890,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        approvedByAdmin: true
      },
      {
        vendorId: insertedVendors.find(v => v.businessName.includes('Mann'))._id,
        title: 'Mann Heavy Haulage - Pan-India Quarry Transport',
        adType: 'category_banner',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
        targetUrl: '/businesses',
        status: 'active',
        priority: 2,
        impressions: 7800,
        clicks: 420,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        approvedByAdmin: true
      }
    ];

    await Advertisement.insertMany(realAds);
    console.log(`Seeded ${realAds.length} Live Platform Advertisements`);

    console.log('\n=============================================');
    console.log('REAL STONE MARKET INDIA DATABASE SEEDING COMPLETED!');
    console.log('Super Admin Login: admin@mockstonemarket.com / admin123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedRealData();
