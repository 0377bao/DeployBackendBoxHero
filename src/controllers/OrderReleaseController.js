const OrderReleaseService = require('../services/OrderReleaseService');

class OrderReleaseController {
    async createOrderRelease(req, res) {
        try {
            const { statusHttp, ...response } = await OrderReleaseService.createOrderRelease(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async getAllOrderRelease(req, res) {
        try {
            const { warehouseID, page } = req.query;
            const { statusHttp, ...response } = await OrderReleaseService.getAllOrderRelease(warehouseID, page);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async filterOrderRelease(req, res) {
        try {
            const { statusHttp, ...response } = await OrderReleaseService.filterOrderRelease(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async checkOrderReleaseID(req, res) {
        try {
            const { orderReleaseID } = req.params;
            const { statusHttp, ...response } = await OrderReleaseService.checkOrderReleaseID(orderReleaseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async getSuggestExport(req, res) {
        try {
            const { type, items } = req.body;
            const { statusHttp, ...response } = await OrderReleaseService.getSuggestExport(type, items);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async getOrderReleaseById(req, res) {
        try {
            const { orderReleaseID } = req.params;
            const { statusHttp, ...response } = await OrderReleaseService.getOrderReleaseById(orderReleaseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async generateQR(req, res) {
        try {
            const { statusHttp, ...response } = await OrderReleaseService.generateQRForOrderReleases();
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async completeOrderRelease(req, res) {
        try {
            const { orderReleaseID } = req.body;
            const { statusHttp, ...response } = await OrderReleaseService.completeOrderRelease(orderReleaseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async refuseOrderRelease(req, res) {
        try {
            const { orderReleaseID } = req.body;
            const { statusHttp, ...response } = await OrderReleaseService.refuseOrderRelease(orderReleaseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
}

module.exports = new OrderReleaseController();
