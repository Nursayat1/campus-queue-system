const QueueTicket = require("../models/QueueTicket");
const Counter = require("../models/Counter");

async function issueTicket(req, res, next) {
  try {
    const { serviceId, priority = 0 } = req.body;

    const counter = await Counter.findOneAndUpdate(
      { _id: `service_${serviceId}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const ticket = await QueueTicket.create({
      serviceId,
      ticketNumber: counter.seq,
      studentId: req.user.sub,
      priority
    });

    res.status(201).json(ticket);
  } catch (e) {
    next(e);
  }
}

async function listQueue(req, res, next) {
  try {
    const { serviceId } = req.query;

    const tickets = await QueueTicket.find({
      serviceId,
      status: "waiting"
    }).sort({ priority: -1, createdAt: 1 });

    res.json(tickets);
  } catch (e) {
    next(e);
  }
}

async function callNext(req, res, next) {
  try {
    const { serviceId } = req.body;

    const ticket = await QueueTicket.findOneAndUpdate(
      { serviceId, status: "waiting" },
      { $set: { status: "called", calledAt: new Date() } },
      { sort: { priority: -1, createdAt: 1 }, new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "No waiting tickets" });
    }

    res.json(ticket);
  } catch (e) {
    next(e);
  }
}

module.exports = { issueTicket, listQueue, callNext };
