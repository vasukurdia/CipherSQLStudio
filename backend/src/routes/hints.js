const router = require("express").Router();
const hintController = require("../controllers/hintController");

router.post("/", hintController.getHint);

module.exports = router;
