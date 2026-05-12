module.exports = (requiredRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const userRole = (req.user.role || '').toLowerCase();
  const check = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const allowed = check.map(r => (r || '').toLowerCase());
  if (!allowed.includes(userRole)) return res.status(403).json({ message: 'Forbidden' });
  return next();
};
