const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    rules: {
      slotDurationMin: { type: Number, default: 10 },
      allowWalkIn: { type: Boolean, default: true },
      priorityEnabled: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
