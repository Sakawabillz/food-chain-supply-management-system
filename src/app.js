const express = require('express');
const app = express();
require('dotenv').config()
const dns = require("node:dns")
dns.setServers(['1.1.1.1', '8.8.8.8'])
const dbConnect = require("./config/db")

dbConnect()

app.use(express.json());
const authRoutes = require("./routes/auth.routes");

app.use("/api/auth", authRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

module.exports = app;
