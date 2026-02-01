const Service = require("../models/Service");

async function createService(req, res, next) {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (e) {
    next(e);
  }
}

async function listServices(req, res, next) {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (e) {
    next(e);
  }
}

async function getService(req, res, next) {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (e) {
    next(e);
  }
}

async function updateService(req, res, next) {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (e) {
    next(e);
  }
}

async function deleteService(req, res, next) {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { createService, listServices, getService, updateService, deleteService };
