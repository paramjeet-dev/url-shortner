const mongoose = require('mongoose');

const clickEventSchema = new mongoose.Schema({
  clickedAt: { type: Date, default: Date.now },
  referrer: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' }
});

const urlSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Url', urlSchema);