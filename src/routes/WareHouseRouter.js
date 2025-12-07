const express = require('express');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const WarehouseController = require('../controllers/WarehouseController');
const { checkGetDetail } = require('../validates/warehouse.validation');
const router = express.Router();

router.get('/list', WarehouseController.getListWarehouse);
router.get('/get-detail/:id', checkGetDetail, WarehouseController.getWarehouseDetail);

module.exports = router;
