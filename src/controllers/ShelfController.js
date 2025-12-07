const ShelfService = require('../services/ShelfService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class ShelfController {
    // get /get-all
    async getAllShelfOfWarehouse(req, res) {
        try {
            const { statusHttp, ...response } = await ShelfService.getAllShelfOfWarehouse(req.params.warehouseID);
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

module.exports = new ShelfController();
