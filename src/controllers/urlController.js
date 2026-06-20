const urlService = require('../services/urlService');
const { isValidUrl } = require('../middleware/validator');
const { addClickJob } = require('../queues/clickQueue');

exports.createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, expiresInDays, customAlias, password } = req.body;
    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid URL provided' });
    }

    const result = await urlService.createShortUrl(
      originalUrl,
      expiresInDays || 30,
      customAlias,
      req.user._id,
      password
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
    const token = req.query.pwd_token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.shortCode === code) {
          const urlData = await urlService.getOriginalUrl(
            code,
            domain,
            true
          );

          if (urlData && !urlData.requiresPassword) {
            return res.redirect(301, urlData.originalUrl);
          }
        }
      } catch (err) {
        // Invalid/expired token; continue normal flow
      }
    }

    const urlData = await urlService.getOriginalUrl(code);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found or expired',
      });
    }

    if (urlData.requiresPassword) {
      return res.status(403).json({
        success: false,
        message: 'Password required',
        requiresPassword: true,
        shortCode: code,
      });
    }

    const referrer = req.headers.referer || '';
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress;

    addClickJob(code, referrer, userAgent, ip).catch(console.error);

    return res.redirect(301, urlData.originalUrl);
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
    const token = await urlService.verifyPassword(code, password);
    res.json({ success: true, token });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.generateQR = async (req, res, next) => {
  try {
    const { code } = req.params;

    const qrBuffer = await urlService.generateQRCode(code);

    res.set('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (error) {
    next(error);
  }
};