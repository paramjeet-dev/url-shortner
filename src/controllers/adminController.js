const User = require('../models/User');
const Url = require('../models/Url');

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -__v');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// Get all links with pagination and search
exports.getLinks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [links, total] = await Promise.all([
      Url.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Url.countDocuments(query),
    ]);
    res.json({
      success: true,
      links,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete any link
exports.deleteLink = async (req, res, next) => {
  try {
    const { code } = req.params;
    const link = await Url.findOneAndDelete({ shortCode: code });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    // Also remove from cache
    await redisClient.del(`shorturl:${code}`).catch(() => {});
    res.json({ success: true, message: 'Link deleted' });
  } catch (error) {
    next(error);
  }
};

// System statistics
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalLinks, totalClicks, activeLinks] = await Promise.all([
      User.countDocuments(),
      Url.countDocuments(),
      Url.aggregate([{ $group: { _id: null, total: { $sum: '$clickCount' } } }]),
      Url.countDocuments({ expiresAt: { $gt: new Date() } }),
    ]);
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalLinks,
        totalClicks: totalClicks[0]?.total || 0,
        activeLinks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Promote user to admin
exports.promoteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User promoted to admin' });
  } catch (error) {
    next(error);
  }
};