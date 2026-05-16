const User = require('../models/user.model');
const generateToken = require('../helpers/generateToken');

module.exports = {
  register: async ({ name, email, password, role }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role ? String(role).toUpperCase() : undefined;
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const err = new Error('Email already in use');
      err.status = 400;
      throw err;
    }
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: normalizedRole
    });
    await user.save();
    return user;
  },

  login: async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isActive) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const token = generateToken({ id: user._id, role: user.role }, { expiresIn: '8h' });
    return { user, token };
  }
};
