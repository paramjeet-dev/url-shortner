const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await RefreshToken.create({ token, userId, expiresAt });
  return token;
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = new User({ name, email, password });
    await user.save();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) { next(error); }
};

exports.refresh = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

  try {
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) return res.status(403).json({ success: false, message: 'Invalid refresh token' });

    if (stored.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: stored._id });
      return res.status(403).json({ success: false, message: 'Refresh token expired' });
    }

    const newAccessToken = generateAccessToken(stored.userId);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) { next(error); }
};

exports.logout = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
  await RefreshToken.deleteOne({ token: refreshToken });
  res.json({ success: true, message: 'Logged out' });
};