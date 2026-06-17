const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const News = require('../models/News');
const AdminLog = require('../models/AdminLog');
const Advertisement = require('../models/Advertisement');
const Inquiry = require('../models/Inquiry');

// Helper to log admin actions
const logAdminAction = async (adminId, action, targetType, targetId, details, ip) => {
  await AdminLog.create({ adminId, action, targetType, targetId, details, ip });
};

// --- Users ---

exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query).limit(limit * 1).skip((page - 1) * limit);
    res.json(users);
  } catch (err) { next(err); }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await logAdminAction(req.user.id, 'USER_STATUS_UPDATED', 'user', user._id, { status }, req.ip);
    res.json(user);
  } catch (err) { next(err); }
};

// --- Vendors ---

exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find().populate('userId', 'name mobile email');
    res.json(vendors);
  } catch (err) { next(err); }
};

exports.verifyVendor = async (req, res, next) => {
  try {
    const { gstVerified, documentsVerified } = req.body;
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    if (gstVerified !== undefined) vendor.gstVerified = gstVerified;
    if (documentsVerified !== undefined) vendor.documentsVerified = documentsVerified;
    
    // Auto-update badge logic
    if (vendor.gstVerified && vendor.documentsVerified && vendor.mobileVerified) {
      vendor.badges.verified = true;
    } else {
      vendor.badges.verified = false;
    }

    await vendor.save();
    await logAdminAction(req.user.id, 'VENDOR_VERIFICATION_UPDATED', 'vendor', vendor._id, { gstVerified, documentsVerified }, req.ip);
    res.json(vendor);
  } catch (err) { next(err); }
};

exports.updateVendorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    await logAdminAction(req.user.id, 'VENDOR_STATUS_UPDATED', 'vendor', vendor._id, { status }, req.ip);
    res.json(vendor);
  } catch (err) { next(err); }
};

// --- Listings ---

exports.getListings = async (req, res, next) => {
  try {
    const products = await Product.find().populate('vendorId', 'businessName');
    res.json(products);
  } catch (err) { next(err); }
};

exports.deleteListing = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Listing not found' });
    
    await logAdminAction(req.user.id, 'LISTING_DELETED', 'product', product._id, { name: product.name }, req.ip);
    res.json({ message: 'Listing deleted' });
  } catch (err) { next(err); }
};

// --- News ---

exports.publishNews = async (req, res, next) => {
  try {
    const news = await News.create({ ...req.body, createdBy: req.user.id });
    await logAdminAction(req.user.id, 'NEWS_PUBLISHED', 'news', news._id, { title: news.title }, req.ip);
    res.status(201).json(news);
  } catch (err) { next(err); }
};

exports.updateNews = async (req, res, next) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (err) { next(err); }
};

// --- Notifications ---

exports.sendPushNotification = async (req, res, next) => {
  try {
    const { title, body, target } = req.body;
    // Mock push notification logic
    console.log(`[MOCK FCM PUSH] To: ${target} | Title: ${title} | Body: ${body}`);
    res.json({ message: 'Push notification sent (Mock)' });
  } catch (err) { next(err); }
};

// --- Analytics & Logs ---

exports.getAnalytics = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    const vendorCount = await Vendor.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const inquiriesToday = await Inquiry.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });

    res.json({
      userCount,
      vendorCount,
      activeProducts,
      inquiriesToday
    });
  } catch (err) { next(err); }
};

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await AdminLog.find().populate('adminId', 'name').sort('-createdAt').limit(100);
    res.json(logs);
  } catch (err) { next(err); }
};
