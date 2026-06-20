const mongoose = require('mongoose');

const clickEventSchema = new mongoose.Schema({
  clickedAt: { type: Date, default: Date.now },
  referrer: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' }
});

const urlSchema = new mongoose.Schema({
  title: {
  type: String,
  trim: true,
  default: '',
},
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  clickCount: {
    type: Number,
    default: 0
  },
  clickEvents: [clickEventSchema],
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
  index: true,
},
});

// TTL index: automatically remove documents after expiresAt
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// dynamically check if the URL is expired
urlSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

module.exports = mongoose.model('Url', urlSchema);