const BatchMoveLogService = require('../services/BatchMoveLogService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_OK = process.env.HTTP_OK;

class BatchMoveLogController {
    // get /filter
    async filterLog(req, res) {
        try {
            const { statusHttp, ...response } = await BatchMoveLogService.filterLog({
                ...req.query,
            });
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

module.exports = new BatchMoveLogController();
