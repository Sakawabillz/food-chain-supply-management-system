module.exports = (validator) => (req, res, next) => {
  const result = validator(req.body);

  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.errors
    });
  }

  return next();
};
