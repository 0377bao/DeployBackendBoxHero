const UnitService = require('../services/UnitService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_OK = process.env.HTTP_OK;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;

class UnitController {
    // get /get-all
    async getAllUnit(req, res) {
        try {
            const { statusHttp, ...response } = await UnitService.getAllUnit();
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }

    // get /get-by-product/:productID
    async getUnitsByProduct(req, res) {
        try {
            const { productID } = req.params;
            if (!productID) {
                return res.status(HTTP_BAD_REQUEST).json({
                    status: 'ERR',
                    message: ['The productID is required'],
                });
            }
            const { statusHttp, ...response } = await UnitService.getUnitsByProduct(productID);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }
    // post /get-total-valid-amount
    async getTotalValidAmountByProductAndUnit(req, res) {
        try {
            const items = req.body;
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(HTTP_BAD_REQUEST).json({
                    status: 'ERR',
                    message: ['Items list is required and must be an array'],
                });
            }
            const { statusHttp, ...response } = await UnitService.getTotalValidAmountByProductAndUnit(items);
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

module.exports = new UnitController();
