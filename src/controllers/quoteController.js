const QuoteRequest = require('../models/QuoteRequest');
const BusinessFavorite = require('../models/BusinessFavorite');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.createQuoteRequest = async (req, res, next) => {
  try {
    const { business_id, product_id, quantity, unit, message } = req.body;

    const quote = await QuoteRequest.create({
      userId: req.user.id,
      businessId: business_id,
      productId: product_id,
      quantity,
      unit,
      message
    });

    return successResponse(res, 'Quote requested successfully', quote, 201);
  } catch (err) {
    next(err);
  }
};

exports.toggleBusinessFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exists = await BusinessFavorite.findOne({ userId: req.user.id, businessId: id });

    if (exists) {
      if (req.method === 'DELETE') {
        await BusinessFavorite.deleteOne({ _id: exists._id });
        return successResponse(res, 'Business removed from favorites', null);
      }
      return successResponse(res, 'Business is already favorited', null);
    }

    if (req.method === 'POST') {
      await BusinessFavorite.create({ userId: req.user.id, businessId: id });
      return successResponse(res, 'Business favorited successfully', null, 201);
    }

    return errorResponse(res, 'Invalid request method', null, 400);
  } catch (err) {
    next(err);
  }
};
