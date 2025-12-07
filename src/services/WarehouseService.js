const db = require('../../models');
const Warehouse = db.Warehouse;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class WarehouseService {
    createWarehouse(data) {}
    findAll() {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await Warehouse.findAll();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách kho thành công',
                    warehouses: response,
                });
            } catch (err) {
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    findById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await Warehouse.findByPk(id);
                if (!response) {
                    return resolve({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Kho không tồn tại',
                    });
                }
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy thông tin kho thành công',
                    warehouse: response,
                });
            } catch (err) {
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
}

module.exports = new WarehouseService();
