const Appointment = require("../models/Appointment");

async function serviceLoad(req, res, next) {
  try {
    const { from, to } = req.query;

    const match = {};
    if (from || to) {
      match.startTime = {};
      if (from) match.startTime.$gte = new Date(from);
      if (to) match.startTime.$lt = new Date(to);
    }

    const pipeline = [
      Object.keys(match).length ? { $match: match } : null,
      {
        $group: {
          _id: "$serviceId",
          totalAppointments: { $sum: 1 },
          avgPriority: { $avg: "$priority" },
          earliest: { $min: "$startTime" },
          latest: { $max: "$startTime" }
        }
      },
      { $sort: { totalAppointments: -1 } },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service"
        }
      },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          serviceId: "$_id",
          serviceName: "$service.name",
          totalAppointments: 1,
          avgPriority: { $round: ["$avgPriority", 2] },
          earliest: 1,
          latest: 1
        }
      }
    ].filter(Boolean);

    const result = await Appointment.aggregate(pipeline);
    res.json(result);
  } catch (e) {
    next(e);
  }
}


async function rebuildServiceLoadMaterialized(req, res, next) {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$serviceId",
          totalAppointments: { $sum: 1 },
          avgPriority: { $avg: "$priority" },
          earliest: { $min: "$startTime" },
          latest: { $max: "$startTime" }
        }
      },
      {
        $project: {
          _id: 0,
          serviceId: "$_id",
          totalAppointments: 1,
          avgPriority: { $round: ["$avgPriority", 2] },
          earliest: 1,
          latest: 1,
          updatedAt: "$$NOW"
        }
      },
      {
        $merge: {
          into: "service_load_analytics",
          on: "serviceId",
          whenMatched: "replace",
          whenNotMatched: "insert"
        }
      }
    ];

    await require("../models/Appointment").aggregate(pipeline);
    res.json({ ok: true, message: "service_load_analytics rebuilt" });
  } catch (e) {
    next(e);
  }
}

const ServiceLoadAnalytics = require("../models/ServiceLoadAnalytics");

async function getServiceLoadMaterialized(req, res, next) {
  try {
    const docs = await ServiceLoadAnalytics.find().sort({ totalAppointments: -1 }).limit(100);
    res.json(docs);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  serviceLoad,
  rebuildServiceLoadMaterialized,
  getServiceLoadMaterialized
};
