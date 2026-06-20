const Url = require('../models/Url');
const { generateUniqueCode, isAliasAvailable, validateAlias } = require('../utils/shortCode');
const redisClient = require('../config/redis');

const createShortUrl = async (originalUrl, expiresInDays = 30, customAlias = null,userId) => {
  let shortCode;

  if (customAlias) {
    if (!validateAlias(customAlias)) {
      throw new Error('Invalid alias format. Use 4-20 alphanumeric, underscore, or hyphen.');
    }
    const available = await isAliasAvailable(customAlias);
    if (!available) {
      throw new Error('Alias already taken.');
    }
    shortCode = customAlias;
  } else {
    shortCode = await generateUniqueCode();
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const urlDoc = new Url({
    originalUrl,
    shortCode,
    expiresAt,
    userId
  });

  await urlDoc.save();

  // Cache it
  await redisClient.setEx(
    `shorturl:${shortCode}`,
    expiresInDays * 24 * 60 * 60,
    originalUrl
  );

  return {
    shortCode,
    shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    expiresAt
  };
};

const updateUrlTitle = async (shortCode, userId, title) => {
  const url = await Url.findOne({ shortCode, userId });
  if (!url) {
    throw new Error('Link not found or you do not have permission');
  }
  url.title = title;
  await url.save();
  return url;
};

const getUserUrls = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [urls, total] = await Promise.all([
    Url.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Url.countDocuments({ userId }),
  ]);
  // Add virtuals manually if needed
  return { urls, total, page, totalPages: Math.ceil(total / limit) };
};

const deleteUrl = async (shortCode, userId) => {
  const result = await Url.findOneAndDelete({ shortCode, userId });
  if (!result) {
    throw new Error('Link not found or you do not have permission');
  }
  // Also delete from cache
  await redisClient.del(`shorturl:${shortCode}`).catch(() => {});
  return result;
};

const getOriginalUrl = async (shortCode) => {
  const cacheKey = `shorturl:${shortCode}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return cached;
    }
  } catch (err) {
    console.error('Redis read error, falling back to DB:', err.message);
  }

  const urlDoc = await Url.findOne({ shortCode });
  if (!urlDoc) return null;

  // Attempt to cache again (ignore errors)
  try {
    const ttl = Math.floor((urlDoc.expiresAt - Date.now()) / 1000);
    if (ttl > 0) {
      await redisClient.setEx(cacheKey, ttl, urlDoc.originalUrl);
    }
  } catch (err) {
    console.error('Redis write error, continuing:', err.message);
  }

  return urlDoc.originalUrl;
};

const recordClick = async (shortCode, referrer, userAgent, ip) => {
  const urlDoc = await Url.findOne({ shortCode });
  if (!urlDoc) return null;

  // Increment click count and push event
  urlDoc.clickCount += 1;
  urlDoc.clickEvents.push({ referrer, userAgent, ipAddress: ip });
  await urlDoc.save();

  return urlDoc;
};

const getAnalytics = async (shortCode) => {
  const urlDoc = await Url.findOne({ shortCode });
  if (!urlDoc) return null;

  // Aggregate by date and referrer
  const byDate = await Url.aggregate([
    { $match: { shortCode } },
    { $unwind: '$clickEvents' },
    {
      $group: {
        _id: {
          year: { $year: '$clickEvents.clickedAt' },
          month: { $month: '$clickEvents.clickedAt' },
          day: { $dayOfMonth: '$clickEvents.clickedAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        count: 1,
        _id: 0
      }
    }
  ]);

  const byReferrer = await Url.aggregate([
    { $match: { shortCode } },
    { $unwind: '$clickEvents' },
    {
      $group: {
        _id: '$clickEvents.referrer',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $project: { referrer: '$_id', count: 1, _id: 0 } }
  ]);

  return {
    shortCode,
    totalClicks: urlDoc.clickCount,
    byDate,
    byReferrer
  };
};

const extendExpiry = async (shortCode, userId, days) => {
  const url = await Url.findOne({ shortCode, userId });
  if (!url) {
    throw new Error('Link not found or you do not have permission');
  }
  const newExpiry = new Date(url.expiresAt);
  newExpiry.setDate(newExpiry.getDate() + days);
  url.expiresAt = newExpiry;
  await url.save();
  // Update cache TTL
  await redisClient.setEx(`shorturl:${shortCode}`, days * 24 * 60 * 60, url.originalUrl).catch(() => {});
  return url;
};

module.exports = {
  createShortUrl,
  updateTitle,
  getUserUrls,
  deleteUrl,
  getOriginalUrl,
  recordClick,
  getAnalytics,
  extendExpiry
};