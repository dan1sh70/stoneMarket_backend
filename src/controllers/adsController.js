const Advertisement = require('../models/Advertisement');

exports.getAds = async (req, res, next) => {
  try {
    const { type, category, state } = req.query;
    let query = { status: 'active' };
    if (type) query.adType = type;
    if (category) query.targetCategory = category;
    if (state) query.targetState = state;

    const ads = await Advertisement.find(query).sort('-priority');
    res.json(ads);
  } catch (err) { next(err); }
};

exports.createAd = async (req, res, next) => {
  try {
    const ad = await Advertisement.create(req.body);
    res.status(201).json(ad);
  } catch (err) { next(err); }
};

exports.updateAd = async (req, res, next) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.json(ad);
  } catch (err) { next(err); }
};

exports.recordImpression = async (req, res, next) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.json({ message: 'Impression recorded' });
  } catch (err) { next(err); }
};

exports.recordClick = async (req, res, next) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.json({ message: 'Click recorded' });
  } catch (err) { next(err); }
};

exports.getAdStats = async (req, res, next) => {
  try {
    const ads = await Advertisement.find().select('title adType impressions clicks status');
    res.json(ads);
  } catch (err) { next(err); }
};
