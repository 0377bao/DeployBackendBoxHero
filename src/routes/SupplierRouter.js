const express = require('express');
const validate = require('../validates/validate');
const SupplierController = require('../controllers/SupplierController');
const {
    checkEmailExists,
    checkSupplierValidate,
    checkSupplierIDValidate,
} = require('../validates/supplier.validation');
const {
    authUserIsManager,
    authUserIsManagerWithoutWarehouse,
    authUserIsManagerOrStockReceiver,
} = require('../middleware/AuthMiddleware');
const router = express.Router();

// check mail đã tồn tại
router.get('/check-email-exists', checkEmailExists, validate, SupplierController.getSupplierByID);

// Lấy danh sách tất cả các sản phẩm mà nhà cung cấp đã cung cấp
router.get(
    '/provided-products/:supplierID',
    checkSupplierIDValidate,
    authUserIsManagerOrStockReceiver,
    SupplierController.getProductsBySupplierID,
);

// Tạo nhà cung cấp
router.post('/', authUserIsManagerOrStockReceiver, checkSupplierValidate, validate, SupplierController.createSupplier);

// Sửa nhà cung cấp
router.put('/:supplierID', authUserIsManager, checkSupplierValidate, validate, SupplierController.updateSupplier);

// Xóa nhà cung cấp
router.delete('/:supplierID', authUserIsManager, SupplierController.deleteSupplier);

// Lấy thông tin một nhà cung cấp
router.get('/:supplierID', SupplierController.getSupplierByID);

// Lấy danh sách tất cả nhà cung cấp
router.get('/', SupplierController.getAllSuppliers);

module.exports = router;
