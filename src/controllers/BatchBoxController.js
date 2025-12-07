const BatchBoxService = require('../services/BatchBoxService');

class BatchBoxController {
    async suggestBoxes(req, res) {
        try {
            const { statusHttp, ...response } = await BatchBoxService.suggestBoxes(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async updateLocationBatch(req, res) {
        try {
            const { statusHttp, ...response } = await BatchBoxService.updateLocationBatch(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async changeLocation(req, res) {
        try {
            const { statusHttp, ...response } = await BatchBoxService.changeLocation(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async getAllBoxByBatchID(req, res) {
        try {
            const { batchID } = req.query;
            const { statusHttp, ...response } = await BatchBoxService.getAllBoxByBatchID(batchID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
}

module.exports = new BatchBoxController();
