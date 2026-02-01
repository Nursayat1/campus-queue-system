const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const { errorHandler, notFound } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const serviceRoutes = require("./routes/service.routes");
const queueRoutes = require("./routes/queue.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
console.log("mounting /api/queue routes");
app.use("/api/queue", queueRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
