const express = require('express');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const batchRoutes = require('./routes/batch.routes');
const shipmentRoutes = require('./routes/shipment.routes');
const inspectionRoutes = require('./routes/inspection.routes');
const auditRoutes = require('./routes/audit.routes');

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/v1/batch', batchRoutes);
app.use('/api/shipment', shipmentRoutes);
app.use('/api/v1/shipment', shipmentRoutes);
app.use('/api/inspection', inspectionRoutes);
app.use('/api/v1/inspection', inspectionRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/v1/audit', auditRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const errorMiddleware = require('./middlewares/error.middleware');
app.use(errorMiddleware);

module.exports = app;
