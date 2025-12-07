const { query, body, param } = require('express-validator');

const checkCreateOrderRelease = [
    body('orderReleaseID')
        .notEmpty()
        .withMessage('Mã đơn xuất kho bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã đơn xuất kho phải là chuỗi'),
    body('employeeID')
        .notEmpty()
        .withMessage('Mã nhân viên bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã nhân viên phải là chuỗi'),
    body('warehouseID').notEmpty().withMessage('Mã kho bắt buộc').bail().isString().withMessage('Mã kho phải là chuỗi'),
    body('orderReleaseDetails')
        .isArray()
        .withMessage('Chi tiết đơn xuất kho phải là một mảng')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Chi tiết đơn xuất kho không được để trống');
            }
            return true;
        }),
    body('orderReleaseDetails.*.batchID')
        .notEmpty()
        .withMessage('Mã lô hàng là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã lô hàng không hợp lệ'),
    body('orderReleaseDetails.*.quantityExported')
        .notEmpty()
        .withMessage('Số lượng xuất kho là bắt buộc')
        .bail()
        .isNumeric()
        .withMessage('Số lượng xuất kho phải là một số'),
    body('orderReleaseDetails.*.orderReleaseBatchBoxDetails')
        .isArray()
        .withMessage('Chi tiết ô chứa lô hàng phải là một mảng')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Chi tiết ô chứa lô hàng không được để trống');
            }
            return true;
        }),
    body('orderReleaseDetails.*.orderReleaseBatchBoxDetails.*.boxID')
        .notEmpty()
        .withMessage('Mã ô chứa lô hàng là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã ô chứa lô hàng không hợp lệ'),
    body('orderReleaseDetails.*.orderReleaseBatchBoxDetails.*.quantityExported')
        .notEmpty()
        .withMessage('Số lượng xuất kho là bắt buộc')
        .bail()
        .isNumeric()
        .withMessage('Số lượng xuất kho phải là một số'),
    body('orderReleaseProposalID')
        .notEmpty()
        .withMessage('Mã phiếu đề xuất xuất kho là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã phiếu đề xuất xuất kho không hợp lệ'),
];

module.exports = {
    checkCreateOrderRelease,
};
