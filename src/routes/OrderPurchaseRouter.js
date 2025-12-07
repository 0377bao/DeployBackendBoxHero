const express = require('express');
const router = express.Router();
const OrderPurchaseController = require('../controllers/OrderPurchaseController');
const { checkCreateOrderPurchase, checkUpdateStatusOrderPurchase } = require('../validates/orderPurchase.validation');
const validate = require('../validates/validate');
const { authUserIsManager, authUser, authUserIsManagerOrStockReceiver } = require('../middleware/AuthMiddleware');

router.get('/get-all-order-purchase', authUserIsManagerOrStockReceiver, OrderPurchaseController.getAllOrderPurchase);
router.get('/filter-order-purchase', authUserIsManagerOrStockReceiver, OrderPurchaseController.filterOrderPurchase);

router.post(
    '/create-order-purchase',
    authUserIsManagerOrStockReceiver,
    checkCreateOrderPurchase,
    validate,
    OrderPurchaseController.createOrderPurchase,
);

router.post(
    '/update-status-order-purchase',
    authUserIsManagerOrStockReceiver,
    checkUpdateStatusOrderPurchase,
    validate,
    OrderPurchaseController.updateStatusOrderPurchase,
);

module.exports = router;
