const Url = require('../models/Url');
const { generateUniqueCode } = require('../utils/shortCode');
const redisClient = require('../config/redis');

const createShortUrl = async (originalUrl, expiresInDays = 30) => {
  // Validate URL
  const shortCode = await generateUniqueCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const urlDoc = new Url({
    originalUrl,
    shortCode,
    expiresAt
  });

  await urlDoc.save();

  // Cache the new URL immediately
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

const getOriginalUrl = async (shortCode) => {
  const cacheKey = `shorturl:${shortCode}`;
  // 1. Check cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Check DB
  const urlDoc = await Url.findOne({ shortCode });
  if (!urlDoc) {
    return null;
  }

  // 3. Cache it
  const ttl = Math.floor((urlDoc.expiresAt - Date.now()) / 1000);
  if (ttl > 0) {
    await redisClient.setEx(cacheKey, ttl, urlDoc.originalUrl);
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

module.exports = {
  createShortUrl,
  getOriginalUrl,
  recordClick,
  getAnalytics
};