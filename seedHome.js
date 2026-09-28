require('dotenv').config();
const mongoose = require('mongoose');
const HomeBanner = require('./src/models/HomeBanner');
const MainCategory = require('./src/models/MainCategory');
const ProductInterest = require('./src/models/ProductInterest');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stone-market', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedData = async () => {
  try {
    console.log('Seeding Home Page Data...');
    
    await HomeBanner.deleteMany({});
    await MainCategory.deleteMany({});

    await HomeBanner.insertMany([
      {
        title: "Connect With India's Stone Industry",
        subtitle: "Direct from verified mines",
        description: "Explore premium granite from trusted suppliers.",
        image: "https://via.placeholder.com/1200x400.png?text=Premium+Granite",
        mobile_image: "https://via.placeholder.com/600x400.png?text=Premium+Granite",
        button_text: "Explore Now",
        target_type: "category",
        sort_order: 1,
        status: 'active'
      },
      {
        title: "Top Machinery Services",
        subtitle: "Keep your business running",
        description: "Find the best repairing services in your area.",
        image: "https://via.placeholder.com/1200x400.png?text=Machinery",
        mobile_image: "https://via.placeholder.com/600x400.png?text=Machinery",
        button_text: "View Services",
        target_type: "service",
        sort_order: 2,
        status: 'active'
      }
    ]);

    await MainCategory.insertMany([
      { name: "Mining", slug: "mining", image: "https://via.placeholder.com/200?text=Mining", sort_order: 1 },
      { name: "Manufacturer", slug: "manufacturer", image: "https://via.placeholder.com/200?text=Manufacturer", sort_order: 2 },
      { name: "Showroom", slug: "showroom", image: "https://via.placeholder.com/200?text=Showroom", sort_order: 3 },
      { name: "Trader", slug: "trader", image: "https://via.placeholder.com/200?text=Trader", sort_order: 4 },
      { name: "Transport", slug: "transport", image: "https://via.placeholder.com/200?text=Transport", sort_order: 5 }
    ]);

    console.log('Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
