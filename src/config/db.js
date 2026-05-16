const mongoose = require('mongoose');

function connect(uri, opts = {}) {
  return mongoose.connect(uri, opts);
}

module.exports = { connect, mongoose };
