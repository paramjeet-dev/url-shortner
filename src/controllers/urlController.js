const urlService = require('../services/urlService');
const { isValidUrl } = require('../middleware/validator');
const { addClickJob } = require('../queues/clickQueue');

exports.createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, expiresInDays, customAlias } = req.body;
    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL provided'
      });
    }

    const result = await urlService.createShortUrl(originalUrl, expiresInDays || 30, customAlias,req.user._id);
    res.status(201).json({
      success: true,
      ...result
    });
  } catch (error) {
    // Distinguish custom alias errors
    if (error.message.includes('alias')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.redirectToUrl = async (req, res, next) => {
  try {
    const { code } = req.params;
    const originalUrl = await urlService.getOriginalUrl(code);
    if (!originalUrl) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found or expired'
      });
    }

    // Enqueue click event
    const referrer = req.headers.referer || '';
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress;
    addClickJob(code, referrer, userAgent, ip).catch(console.error);

    res.redirect(301, originalUrl);
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const { code } = req.params;
    const analytics = await urlService.getAnalytics(code);
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found'
      });
    }
    res.json({
      success: true,
      ...analytics
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserUrls = async (req, res, next) => {
  try {
    const urls = await urlService.getUserUrls(req.user._id);
    res.json({ success: true, urls });
  } catch (error) {
    next(error);
  }
};

exports.deleteUrl = async (req, res, next) => {
  try {
    const { code } = req.params;
    await urlService.deleteUrl(code, req.user._id);
    res.json({ success: true, message: 'Link deleted' });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};