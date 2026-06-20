const urlService = require('../services/urlService');
const { isValidUrl } = require('../middleware/validator');
const { addClickJob } = require('../queues/clickQueue');

exports.createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, expiresInDays, customAlias, password, customDomain } = req.body;
    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid URL provided' });
    }

    const result = await urlService.createShortUrl(
      originalUrl,
      expiresInDays || 30,
      customAlias,
      req.user._id,
      password,
      customDomain
    );
    res.status(201).json({ success: true, ...result });
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

exports.updateTitle = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { title } = req.body;
    const url = await urlService.updateUrlTitle(code, req.user._id, title);
    res.json({ success: true, url });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.getUserUrls = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await urlService.getUserUrls(req.user._id, page, limit);
    res.json({ success: true, ...result });
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

exports.extendExpiry = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { days } = req.body;
    const url = await urlService.extendExpiry(code, req.user._id, days);
    res.json({ success: true, url });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.verifyPassword = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { password } = req.body;
    const host = req.get('host');
    const token = await urlService.verifyPassword(code, password, host);
    res.json({ success: true, token });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.generateQR = async (req, res, next) => {
  try {
    const { code } = req.params;
    const host = req.get('host');
    const qrBuffer = await urlService.generateQRCode(code, host);
    res.set('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (error) {
    next(error);
  }
};