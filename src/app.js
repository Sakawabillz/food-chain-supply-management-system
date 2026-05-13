const express = require('express');
const batchRoutes = require('./routes/batch.routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/batch', batchRoutes);

module.exports = app;
