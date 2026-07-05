const User = require('../models/User');

// @desc    Get all saved/favorite vendors of user
// @route   GET /api/v1/users/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedBusinesses',
      match: { status: 'active' }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user.savedBusinesses);
  } catch (err) {
    next(err);
  }
};
