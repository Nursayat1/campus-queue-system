const mongoose = require("mongoose");

const QueueTicketSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    ticketNumber: { type: Number, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    priority: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["waiting", "called", "served", "skipped"],
      default: "waiting"
    },
    createdAt: { type: Date, default: Date.now },
    calledAt: Date
  }
);

QueueTicketSchema.index({ serviceId: 1, ticketNumber: 1 }, { unique: true });
QueueTicketSchema.index({ serviceId: 1, status: 1, createdAt: 1 });

module.exports = mongoose.model("QueueTicket", QueueTicketSchema);
