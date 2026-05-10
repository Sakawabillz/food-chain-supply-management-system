const jwt = require('jsonwebtoken');

module.exports = (payload, secret = process.env.JWT_SECRET, opts) => jwt.sign(payload, secret, opts);
