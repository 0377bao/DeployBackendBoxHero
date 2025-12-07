const DashboardService = require('../services/DashboardService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_OK = process.env.HTTP_OK;

class DashboardController {
    async getStatisticalInventory(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getStatisticalInventory(req.query);
            return res.status(statusHttp).json(response);
        } catch (e) {
            return res.status(e.statusHttp).json(e);
        }
    }
    async getStatisticalImportExport(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getStatisticalImportExport(req.query);
            return res.status(statusHttp).json(response);
        } catch (e) {
            return res.status(e.statusHttp).json(e);
        }
    }
    async getStatisticalPercentUsedWarehouse(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getStatisticalPercentUsedWarehouse(req.query);
            return res.status(statusHttp).json(response);
        } catch (e) {
            return res.status(e.statusHttp).json(e);
        }
    }
    async getStatisticalMinStockProduct(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getStaticProductHasLowStock();
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.log(err);
            return res.status(err.statusHttp).json(err);
        }
    }
    async getTopFineProductExportLow(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getTopFineProductExportLow();
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.log(err);
            return res.status(err.statusHttp).json(err);
        }
    }
    async getStaticTopProductExportInWarehouse(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getStaticTopProductExportInWarehouse();
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err.message);
        }
    }
}

module.exports = new DashboardController();
