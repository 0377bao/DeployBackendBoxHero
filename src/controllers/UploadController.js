const UploadService = require('../services/UploadService');

class UploadController {
    async uploadImage(req, res) {
        try {
            const { statusHttp, ...response } = await UploadService.uploadImage(req.file);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json([err.message]);
        }
    }
}

module.exports = new UploadController();
