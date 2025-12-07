const BoxService = require('../services/BoxService');

class BoxController {
    async generateQR(req, res) {
        try {
            const { statusHttp, ...response } = await BoxService.generateQRForBoxes();
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp || 500).json({
                status: 'ERR',
                message: err.message || 'Internal Server Error',
            });
        }
    }
}

module.exports = new BoxController();
