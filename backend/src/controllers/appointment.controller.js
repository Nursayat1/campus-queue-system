const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");

function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.valueOf());
}

async function createAppointment(req, res, next) {
  try {
    const { serviceId, windowId = null, startTime, endTime, priority = 0 } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (!serviceId || !startTime || !endTime) {
      return res.status(400).json({ message: "serviceId, startTime, endTime are required" });
    }
    if (!isValidDate(start) || !isValidDate(end) || end <= start) {
      return res.status(400).json({ message: "Invalid startTime/endTime" });
    }

    const overlapFilter = {
      serviceId,
      status: { $in: ["booked", "checked_in"] },
      startTime: { $lt: end },
      endTime: { $gt: start }
    };
    if (windowId) overlapFilter.windowId = windowId;

    const overlap = await Appointment.findOne(overlapFilter).select("_id startTime endTime");
    if (overlap) {
      return res.status(409).json({ message: "Time slot is already taken" });
    }

    const doc = await Appointment.create({
      serviceId,
      windowId,
      studentId: req.user.sub,
      startTime: start,
      endTime: end,
      priority
    });

    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

async function listAppointments(req, res, next) {
  try {
    const { serviceId, studentId, status, date } = req.query;

    const filter = {};
    if (serviceId) filter.serviceId = serviceId;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    if (date) {
      const dayStart = new Date(date);
      if (!isValidDate(dayStart)) return res.status(400).json({ message: "Invalid date (use YYYY-MM-DD)" });
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filter.startTime = { $gte: dayStart, $lt: dayEnd };
    }

    const docs = await Appointment.find(filter)
      .sort({ startTime: 1 })
      .limit(200);

    res.json(docs);
  } catch (e) {
    next(e);
  }
}

async function getAppointment(req, res, next) {
  try {
    const doc = await Appointment.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Appointment not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const allowed = ["startTime", "endTime", "status", "priority", "windowId"];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

    if ("startTime" in patch) patch.startTime = new Date(patch.startTime);
    if ("endTime" in patch) patch.endTime = new Date(patch.endTime);

    const doc = await Appointment.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: "Appointment not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

async function cancelAppointment(req, res, next) {
  try {
    const doc = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "cancelled" } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Appointment not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

async function addNote(req, res, next) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });

    const note = { byUserId: req.user.sub, text, createdAt: new Date() };

    const doc = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: note } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Appointment not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

async function updateNoteText(req, res, next) {
  try {
    const { noteId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });

    const doc = await Appointment.findOneAndUpdate(
      { _id: req.params.id, "notes._id": new mongoose.Types.ObjectId(noteId) },
      { $set: { "notes.$.text": text } },
      { new: true }
    );

    if (!doc) return res.status(404).json({ message: "Appointment or note not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

async function deleteNote(req, res, next) {
  try {
    const { noteId } = req.params;

    const doc = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $pull: { notes: { _id: new mongoose.Types.ObjectId(noteId) } } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Appointment not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  createAppointment,
  listAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  addNote,
  updateNoteText,
  deleteNote
};
