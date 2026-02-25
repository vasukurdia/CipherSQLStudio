const router = require('express').Router();
const assignmentController = require('../controllers/assignmentController');

router.get('/', assignmentController.getAllAssignments);
router.get('/:id', assignmentController.getAssignmentById);

module.exports = router;
