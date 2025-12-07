const OrderPurchaseService = require('../services/OrderPurchaseService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_OK = process.env.HTTP_OK;

class OrderPurchaseController {
    // get /get-all-order-purchase
    async getAllOrderPurchase(req, res) {
        try {
            const { statusHttp, ...response } = await OrderPurchaseService.getAllOrderPurchase(req.query);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }
    // get /filter-order-purchase
    async filterOrderPurchase(req, res) {
        try {
            const { statusHttp, ...response } = await OrderPurchaseService.filterOrderPurchase(req.query);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }
    // post /create-order-purchase
    async createOrderPurchase(req, res) {
        try {
            const { statusHttp, ...response } = await OrderPurchaseService.createOrderPurchase(req.body);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }
    // post /update-status-order-purchase
    async updateStatusOrderPurchase(req, res) {
        try {
            const { statusHttp, ...response } = await OrderPurchaseService.updateStatusOrderPurchase(req.body);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }
}

module.exports = new OrderPurchaseController();
