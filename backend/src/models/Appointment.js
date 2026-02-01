const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    byUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const AppointmentSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    windowId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceWindow", default: null },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    status: {
      type: String,
      enum: ["booked", "checked_in", "served", "cancelled", "no_show"],
      default: "booked"
    },

    priority: { type: Number, default: 0 },

    notes: { type: [NoteSchema], default: [] }
  },
  { timestamps: true }
);

AppointmentSchema.index({ serviceId: 1, startTime: 1 });
AppointmentSchema.index({ studentId: 1, startTime: -1 });
AppointmentSchema.index({ serviceId: 1, status: 1, startTime: 1 });
AppointmentSchema.index({ serviceId: 1, startTime: 1, status: 1 });
AppointmentSchema.index({ studentId: 1, startTime: -1 });
AppointmentSchema.index({ serviceId: 1, status: 1, startTime: 1 });
AppointmentSchema.index({ studentId: 1, startTime: -1 });


module.exports = mongoose.model("Appointment", AppointmentSchema);
