const mongoose = require('mongoose');

function connect(uri, opts = {}) {
  return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, ...opts });
}

module.exports = { connect, mongoose };
