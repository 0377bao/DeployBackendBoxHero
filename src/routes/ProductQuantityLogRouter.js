const express = require('express');
const router = express.Router();
const ProductQuantityLogController = require('../controllers/ProductQuantityLogController');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');

router.get('/get-log', authUser, ProductQuantityLogController.getLogByProductID);
router.get('/filter', authUserIsManager, ProductQuantityLogController.filterLogByProductID);

module.exports = router;
