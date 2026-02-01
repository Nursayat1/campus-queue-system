const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { permit } = require("../middleware/permit");
const ctrl = require("../controllers/appointment.controller");

router.post("/", auth, permit("student"), ctrl.createAppointment);
router.get("/", auth, ctrl.listAppointments);
router.get("/:id", auth, ctrl.getAppointment);

router.put("/:id", auth, ctrl.updateAppointment);
router.delete("/:id", auth, permit("student"), ctrl.cancelAppointment);

router.post("/:id/notes", auth, ctrl.addNote);
router.put("/:id/notes/:noteId", auth, ctrl.updateNoteText);
router.delete("/:id/notes/:noteId", auth, ctrl.deleteNote);

module.exports = router;
