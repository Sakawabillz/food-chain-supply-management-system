module.exports = {
  success: (res, data) => res.json({ success: true, data }),
  error: (res, status, message) => res.status(status).json({ success: false, message })
};
