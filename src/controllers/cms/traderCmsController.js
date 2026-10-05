const BusinessProfile = require('../../models/BusinessProfile');
const Product = require('../../models/Product');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

exports.updateProfile = async (req, res, next) => {
  try {
    const { company_name, gst_number, established_year, company_details, trader_categories, trader_type, export_countries, iec_number, is_export_unit, monthly_capacity, capacity_unit, granite_colors, brands, owners, working_hours, machines, address, premises_status } = req.body;
    
    const profile = await BusinessProfile.findOneAndUpdate(
      { userId: req.user.id, business_type: 'trader' },
      { 
        company_name, gst_number, established_year, company_details, trader_categories, trader_type, export_countries, 
        iec_number, is_export_unit, monthly_capacity, capacity_unit, granite_colors, brands, owners, working_hours, machines, address, premises_status 
      },
      { new: true, runValidators: true }
    );
    
    if (!profile) return errorResponse(res, 'Trader profile not found', null, 404);
    return successResponse(res, 'Trader profile updated', profile);
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const profile = await BusinessProfile.findOne({ userId: req.user.id, business_type: 'trader' });
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);
    const products = await Product.find({ vendorId: profile._id });
    return successResponse(res, 'Products fetched', products);
  } catch (err) {
    next(err);
  }
};

exports.addProduct = async (req, res, next) => {
  try {
    const profile = await BusinessProfile.findOne({ userId: req.user.id, business_type: 'trader' });
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);
    const product = await Product.create({ ...req.body, vendorId: profile._id, category: 'trader' });
    return successResponse(res, 'Product added', product, 201);
  } catch (err) {
    next(err);
  }
};
