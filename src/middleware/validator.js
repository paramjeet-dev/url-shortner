const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = { isValidUrl };