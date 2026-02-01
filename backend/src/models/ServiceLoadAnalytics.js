const mongoose = require("mongoose");

const ServiceLoadAnalyticsSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    totalAppointments: Number,
    avgPriority: Number,
    earliest: Date,
    latest: Date,
    updatedAt: Date
  },
  { collection: "service_load_analytics", versionKey: false }
);

module.exports = mongoose.model("ServiceLoadAnalytics", ServiceLoadAnalyticsSchema);
