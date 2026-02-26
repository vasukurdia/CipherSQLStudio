const router = require("express").Router();
const queryController = require("../controllers/queryController");
const { optionalAuth, protect } = require("../middleware/auth");

router.post("/execute", optionalAuth, queryController.executeQuery);
router.get("/attempts/:assignmentId", protect, queryController.getUserAttempts);

module.exports = router;
