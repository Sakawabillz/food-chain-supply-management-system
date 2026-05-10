const Audit = require('../models/audit.model');

module.exports = async (req, res, next) => {
  try {
    // non-blocking audit log
    Audit && Audit.create && Audit.create({ action: req.method + ' ' + req.originalUrl }).catch(() => {});
  } catch (e) {}
  next();
};
