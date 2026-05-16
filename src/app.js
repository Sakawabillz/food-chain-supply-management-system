const express = require('express');
const shipmentRoutes = require("./routes/shipment.routes");
const app = express();

app.use(express.json());
app.use("/api/shipment", shipmentRoutes);
const authRoutes = require('./routes/auth.routes');
app.use('/api/v1/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/users', userRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/batch', batchRoutes);

const errorMiddleware = require('./middlewares/error.middleware');
app.use(errorMiddleware);

module.exports = app;
