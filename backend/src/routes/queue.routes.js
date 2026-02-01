const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const { permit } = require("../middleware/permit");
const { issueTicket, listQueue, callNext } = require("../controllers/queue.controller");

router.post("/issue", auth, permit("student"), issueTicket);
router.get("/", auth, listQueue);
router.post("/call-next", auth, permit("staff"), callNext);

module.exports = router;
