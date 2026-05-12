const roleMiddleware = (...allowedRoles) => {

  return (req, res, next) => {

    // Check if user role is allowed
    if (!allowedRoles.includes(req.user.role)) {

      return res.status(403).json({
        success: false,
        message: "Access forbidden. Insufficient permissions."
      });

    }

    next();
  };
};

module.exports = roleMiddleware;
