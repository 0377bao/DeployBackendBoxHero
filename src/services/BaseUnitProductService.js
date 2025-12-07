const db = require('../../models');
const dotenv = require('dotenv');
dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const BaseUnitProduct = db.BaseUnitProduct;

class BaseUnitProductService {
    async getAllBaseUnitProduct() {
        return new Promise(async (resolve, reject) => {
            try {
                const baseUnitProductFind = await BaseUnitProduct.findAll({
                    attributes: ['baseUnitProductID', 'baseUnitName'],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: baseUnitProductFind,
                });
            } catch (e) {
                console.log(e);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
}

module.exports = new BaseUnitProductService();
