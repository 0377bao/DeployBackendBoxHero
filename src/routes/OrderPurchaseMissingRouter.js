const express = require('express');
const router = express.Router();
const OrderPurchaseMissingController = require('../controllers/OrderPurchaseMissingController');
const { checkFilter } = require('../validates/orderPurchaseMissing.validation');
const validate = require('../validates/validate');
const { authUserIsManagerOrStockReceiver } = require('../middleware/AuthMiddleware');

router.get('/get-all', authUserIsManagerOrStockReceiver, OrderPurchaseMissingController.getAllOrderPurchaseMissing);
router.get(
    '/get-by-id/:id',
    authUserIsManagerOrStockReceiver,
    OrderPurchaseMissingController.getOrderPurchaseMissingById,
);
router.get(
    '/filter',
    authUserIsManagerOrStockReceiver,
    checkFilter,
    validate,
    OrderPurchaseMissingController.filterOrderPurchaseMissing,
);

module.exports = router;
