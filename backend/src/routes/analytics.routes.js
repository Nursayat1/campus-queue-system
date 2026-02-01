const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { permit } = require("../middleware/permit");

const {
  serviceLoad,
  rebuildServiceLoadMaterialized,
  getServiceLoadMaterialized
} = require("../controllers/analytics.controller");

router.get("/service-load", auth, permit("admin", "staff"), serviceLoad);
router.post("/service-load/rebuild", auth, permit("admin"), rebuildServiceLoadMaterialized);
router.get("/service-load/materialized", auth, permit("admin", "staff"), getServiceLoadMaterialized);

module.exports = router;

