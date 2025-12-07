const WarehouseService = require('../services/WarehouseService');

class WarehouseController {
    async getListWarehouse(req, res) {
        try {
            const { statusHttp, ...response } = await WarehouseService.findAll();
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json([err.message]);
        }
    }

    async getWarehouseDetail(req, res) {
        try {
            const { id } = req.params;
            const { statusHttp, ...response } = await WarehouseService.findById(id);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json([err.message]);
        }
    }
}

module.exports = new WarehouseController();
