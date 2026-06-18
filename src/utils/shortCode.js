const { nanoid } = require('nanoid');
const Url = require('../models/Url');

const generateUniqueCode = async (length = 6) => {
  let code;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    code = nanoid(length);
    const existing = await Url.findOne({ shortCode: code });
    exists = !!existing;
    attempts++;
  }

  if (exists) {
    throw new Error('Unable to generate a unique short code after multiple attempts');
  }

  return code;
};

// Check if a given alias is available
const isAliasAvailable = async (alias) => {
  const existing = await Url.findOne({ shortCode: alias });
  return !existing;
};

const validateAlias = (alias) => {
  // Only alphanumeric + underscore + hyphen, length 4-20
  const regex = /^[a-zA-Z0-9_-]{4,20}$/;
  return regex.test(alias);
};

module.exports = { generateUniqueCode, isAliasAvailable, validateAlias };