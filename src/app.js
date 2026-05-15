const express = require('express');
const batchRoutes = require('./routes/batch.routes');

const app = express();

app.use(express.json());

const authRoutes = require('./routes/auth.routes');
app.use('/api/v1/auth', authRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/batch', batchRoutes);

const errorMiddleware = require('./middlewares/error.middleware');
app.use(errorMiddleware);

module.exports = app;
