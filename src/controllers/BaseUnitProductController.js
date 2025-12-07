const BaseUnitProductService = require('../services/BaseUnitProductService');

class BaseUnitProductController {
    async getAllBaseUnitProduct(req, res) {
        try {
            const { statusHttp, ...resposne } = await BaseUnitProductService.getAllBaseUnitProduct();
            return res.status(statusHttp).json(resposne);
        } catch (e) {
            const { statusHttp, ...resposne } = e;
            return res.status(statusHttp).json(resposne);
        }
    }
}

module.exports = new BaseUnitProductController();
