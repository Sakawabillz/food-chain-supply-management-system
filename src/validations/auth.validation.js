const isEmail = (s) => typeof s === 'string' && /\S+@\S+\.\S+/.test(s);
const roles = require('../constants/roles');

const validRoles = Object.values(roles);

module.exports = {
  register: (payload = {}) => {
    const errors = [];
    if (!payload.name) errors.push('name is required');
    if (!payload.email) errors.push('email is required');
    else if (!isEmail(payload.email)) errors.push('email is invalid');
    if (!payload.password) errors.push('password is required');
    else if (payload.password.length < 6) errors.push('password must be at least 6 characters');
    if (payload.role && !validRoles.includes(String(payload.role).toUpperCase())) {
      errors.push(`role must be one of: ${validRoles.join(', ')}`);
    }
    return { valid: errors.length === 0, errors };
  },

  login: (payload = {}) => {
    const errors = [];
    if (!payload.email) errors.push('email is required');
    else if (!isEmail(payload.email)) errors.push('email is invalid');
    if (!payload.password) errors.push('password is required');
    return { valid: errors.length === 0, errors };
  }
};
