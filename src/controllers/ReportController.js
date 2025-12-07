const ReportService = require('../services/ReportService');

class ReportController {
    async getReportWarehouse(req, res) {
        try {
            console.log('vafo', req.body);
            const { statusHttp, ...response } = await ReportService.reportStockWarehouse(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(500).json({
                status: 'ERR',
                message: err.message,
            });
        }
    }
}

module.exports = new ReportController();
