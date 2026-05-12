const User = require('../models/user.model');
const generateToken = require('../helpers/generateToken');

module.exports = {
  register: async ({ name, email, password, role }) => {
    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error('Email already in use');
      err.status = 400;
      throw err;
    }
    const user = new User({ name, email, password, role });
    await user.save();
    return user;
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
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
