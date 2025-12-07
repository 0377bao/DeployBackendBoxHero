const SupplierService = require('../services/SupplierService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR || 500;
const HTTP_OK = process.env.HTTP_OK || 200;

class SupplierController {
    // Tạo nhà cung cấp (check email trùng)
    async createSupplier(req, res) {
        try {
            const { email } = req.body;
            if (email) {
                const supplierWithEmail = await SupplierService.getSupplierByEmail(email);
                if (supplierWithEmail) {
                    return res
                        .status(HTTP_OK)
                        .json({ status: 'ERR', message: 'Email đã tồn tại với nhà cung cấp khác' });
                }
            }
            const { status, message, supplier } = await SupplierService.createSupplier(req.body);
            if (status === 'OK') {
                return res.status(HTTP_OK).json({ status, message, supplier });
            } else {
                return res.status(HTTP_OK).json({ status, message });
            }
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ status: 'ERR', message: [e.message] });
        }
    }
    // Cập nhật nhà cung cấp (check email trùng)
    async updateSupplier(req, res) {
        try {
            const { supplierID } = req.params;
            const { email } = req.body;
            if (email) {
                // Kiểm tra email có trùng với nhà cung cấp khác không
                const supplierWithEmail = await SupplierService.getSupplierByEmail(email);
                if (supplierWithEmail && supplierWithEmail.supplierID !== supplierID) {
                    return res
                        .status(HTTP_OK)
                        .json({ status: 'ERR', message: 'Email đã tồn tại với nhà cung cấp khác' });
                }
            }
            const { status, message, supplier } = await SupplierService.updateSupplier(supplierID, req.body);
            if (status === 'OK') {
                return res.status(HTTP_OK).json({ status, message, supplier });
            } else {
                return res.status(HTTP_OK).json({ status, message });
            }
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ status: 'ERR', message: [e.message] });
        }
    }
    // Xóa nhà cung cấp
    async deleteSupplier(req, res) {
        try {
            const { supplierID } = req.params;
            const { status, message } = await SupplierService.deleteSupplier(supplierID);
            return res.status(HTTP_OK).json({ status, message });
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ status: 'ERR', message: [e.message] });
        }
    }
    // Lấy thông tin một nhà cung cấp
    async getSupplierByID(req, res) {
        try {
            const { supplierID } = req.params;
            const supplier = await SupplierService.getSupplierByID(supplierID);
            if (supplier) {
                return res.status(HTTP_OK).json({ status: 'OK', supplier });
            } else {
                return res.status(HTTP_OK).json({ status: 'ERR', message: 'Không tìm thấy nhà cung cấp' });
            }
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ status: 'ERR', message: [e.message] });
        }
    }

    // Lấy danh sách/tìm kiếm nhà cung cấp (phân trang và filter)
    async getAllSuppliers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status || 'ACTIVE';
            const searchFields = {
                supplierID: req.query.supplierID,
                phoneNumber: req.query.phoneNumber,
                email: req.query.email,
                address: req.query.address,
                supplierName: req.query.supplierName,
            };
            // Nếu có bất kỳ trường tìm kiếm nào thì gọi search, không thì lấy tất cả
            const hasSearch = Object.values(searchFields).some((v) => v);
            let result;
            if (hasSearch) {
                result = await SupplierService.searchSuppliers(searchFields, page, limit, status);
            } else {
                result = await SupplierService.getAllSuppliers(page, limit, status);
            }
            return res.status(HTTP_OK).json({ status: 'OK', ...result });
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ status: 'ERR', message: [e.message] });
        }
    }

    // Lấy danh sách sản phẩm mà nhà cung cấp đã cung cấp
    async getProductsBySupplierID(req, res) {
        try {
            const { supplierID } = req.params;
            const page = parseInt(req.query.page) || 1;
            const { statusHttp, ...response } = await SupplierService.getProductsBySupplierID(supplierID, page);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ status: 'ERR', message: [e.message] });
        }
    }
}

module.exports = new SupplierController();
