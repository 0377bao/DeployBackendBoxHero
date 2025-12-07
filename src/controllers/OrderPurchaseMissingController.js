const OrderPurchaseMissingService = require('../services/OrderPurchaseMissingService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_OK = process.env.HTTP_OK;

class OrderPurchaseMissingController {
    // get /get-all
    async getAllOrderPurchaseMissing(req, res) {
        try {
            const { statusHttp, ...response } = await OrderPurchaseMissingService.getAllOrderPurchaseMissing();
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }

    // get /get-by-id/:id
    async getOrderPurchaseMissingById(req, res) {
        try {
            const { statusHttp, ...response } = await OrderPurchaseMissingService.getOrderPurchaseMissingById(
                req.params.id,
            );
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }

    async filterOrderPurchaseMissing(req, res) {
        try {
            const { statusHttp, ...response } = await OrderPurchaseMissingService.filterOrderPurchaseMissing(req.query);
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

module.exports = new OrderPurchaseMissingController();
