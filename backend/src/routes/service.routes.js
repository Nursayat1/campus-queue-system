const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { permit } = require("../middleware/permit");
const {
  createService,
  listServices,
  getService,
  updateService,
  deleteService
} = require("../controllers/service.controller");

router.get("/", auth, listServices);
router.get("/:id", auth, getService);

router.post("/", auth, permit("admin"), createService);
router.put("/:id", auth, permit("admin"), updateService);
router.delete("/:id", auth, permit("admin"), deleteService);

module.exports = router;
