const router = require('express').Router();
const ReportController = require('../controllers/ReportController');
const { authUserIsManager } = require('../middleware/AuthMiddleware');

router.post('/', authUserIsManager, ReportController.getReportWarehouse);

module.exports = router;
