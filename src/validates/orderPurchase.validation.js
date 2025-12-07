const { query, body, param } = require('express-validator');

const checkCreateOrderPurchase = [
    body('orderPurchaseID')
        .notEmpty()
        .withMessage('Mã đơn nhập hàng bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã đơn nhập hàng phải là chuỗi'),
    body('employeeID')
        .notEmpty()
        .withMessage('Mã nhân viên bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã nhân viên phải là chuỗi'),
    body('warehouseID').notEmpty().withMessage('Mã kho bắt buộc').bail().isString().withMessage('Mã kho phải là chuỗi'),
    body('orderReturnID').optional().isString().withMessage('Mã đơn trả phải là chuỗi'),
    body('proposalID').optional().isString().withMessage('Mã đề xuất phải là chuỗi'),
    body('status')
        .optional()
        .isString()
        .withMessage('Trạng thái phải là chuỗi')
        .isIn(['COMPLETED', 'INCOMPLETE', 'CANCELED'])
        .withMessage('Trạng thái không phải là PENDING, COMPLETED hoặc CANCELLED'),
    body('type')
        .optional()
        .isString()
        .withMessage('Loại phải là chuỗi')
        .isIn(['NORMAL', 'SUPPLEMENT'])
        .withMessage('Loại không phải là NORMAL hoặc SUPPLEMENT'),
    body('originalOrderPurchaseID').optional().isString().withMessage('Mã đơn nhập gốc phải là chuỗi'),
    body('orderPurchaseDetails')
        .isArray()
        .withMessage('Chi tiết đơn nhập hàng phải là một mảng')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Chi tiết đơn nhập hàng không được để trống');
            }
            return true;
        }),
    body('orderPurchaseDetails.*.batchID')
        .notEmpty()
        .withMessage('Mã lô hàng là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã lô hàng không hợp lệ'),
    body('orderPurchaseDetails.*.requestedQuantity')
        .notEmpty()
        .withMessage('Số lượng là bắt buộc')
        .bail()
        .isNumeric()
        .withMessage('Số lượng phải là một số'),
    body('orderPurchaseDetails.*.actualQuantity')
        .notEmpty()
        .withMessage('Số lượng thực tế là bắt buộc')
        .bail()
        .isNumeric()
        .withMessage('Số lượng thực tế phải là một số'),
    body('orderPurchaseDetails.*.unitID')
        .notEmpty()
        .withMessage('Đơn vị là bắt buộc')
        .bail()
        .isString()
        .withMessage('Đơn vị không hợp lệ'),
    body('orderPurchaseDetails.*.manufactureDate')
        .notEmpty()
        .withMessage('Ngày sản xuất là bắt buộc')
        .bail()
        .isDate()
        .withMessage('Ngày sản xuất không hợp lệ'),
    body('orderPurchaseDetails.*.expiryDate')
        .notEmpty()
        .withMessage('Ngày hết hạn là bắt buộc')
        .bail()
        .isDate()
        .withMessage('Ngày hết hạn không hợp lệ'),
    body('orderPurchaseDetails.*.productID')
        .notEmpty()
        .withMessage('Mã sản phẩm là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã sản phẩm không hợp lệ'),
    body('orderPurchaseDetails.*.supplierID')
        .notEmpty()
        .withMessage('Mã nhà cung cấp là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã nhà cung cấp không hợp lệ'),
];

const checkUpdateStatusOrderPurchase = [
    body('orderPurchaseID')
        .notEmpty()
        .withMessage('Mã đơn nhập hàng là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã đơn nhập hàng không hợp lệ'),
    body('status')
        .notEmpty()
        .withMessage('Trạng thái là bắt buộc')
        .bail()
        .isString()
        .withMessage('Trạng thái không hợp lệ')
        .isIn(['COMPLETED', 'CANCELED'])
        .withMessage('Trạng thái không phải là COMPLETED hoặc CANCELED'),
];

module.exports = { checkCreateOrderPurchase, checkUpdateStatusOrderPurchase };
