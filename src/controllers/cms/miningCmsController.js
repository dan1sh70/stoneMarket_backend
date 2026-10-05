const BusinessProfile = require('../../models/BusinessProfile');
const Product = require('../../models/Product');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

exports.updateProfile = async (req, res, next) => {
  try {
    const { company_name, gst_number, established_year, company_details, ec_number, monthly_capacity, machines, address } = req.body;
    
    const profile = await BusinessProfile.findOneAndUpdate(
      { userId: req.user.id, business_type: 'mining' },
      { 
        company_name, gst_number, established_year, company_details, ec_number, 
        monthly_capacity, machines, address 
      },
      { new: true, runValidators: true }
    );
    
    if (!profile) return errorResponse(res, 'Mining profile not found for this user', null, 404);
    return successResponse(res, 'Mining profile updated successfully', profile);
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const profile = await BusinessProfile.findOne({ userId: req.user.id, business_type: 'mining' });
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);
    
    const products = await Product.find({ vendorId: profile._id });
    return successResponse(res, 'Products fetched', products);
  } catch (err) {
    next(err);
  }
};

exports.addProduct = async (req, res, next) => {
  try {
    const profile = await BusinessProfile.findOne({ userId: req.user.id, business_type: 'mining' });
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);
    
    const product = await Product.create({ ...req.body, vendorId: profile._id, category: 'mining' });
    return successResponse(res, 'Product added', product, 201);
  } catch (err) {
    next(err);
  }
};
