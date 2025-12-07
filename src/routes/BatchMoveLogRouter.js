const express = require('express');
const router = express.Router();
const BatchMoveLogController = require('../controllers/BatchMoveLogController');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');

router.get('/filter', authUserIsManager, BatchMoveLogController.filterLog);

module.exports = router;
