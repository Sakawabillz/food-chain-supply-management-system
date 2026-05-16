const authService = require('../services/auth.service');

module.exports = {
  register: async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      const user = await authService.register({ name, email, password, role });
      return res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      return next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login({ email, password });
      return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      return next(err);
    }
  }
};
