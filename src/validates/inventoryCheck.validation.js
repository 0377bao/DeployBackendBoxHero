const { query, body } = require('express-validator');

const getAllInventoryChecks = [query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail()];

const createInventoryCheck = [
    body('inventoryCheckID').notEmpty().withMessage('Mã kiểm kê là bắt buộc').bail(),
    body('employeeID').notEmpty().withMessage('Mã nhân viên là bắt buộc').bail(),
    body('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail(),
    body('checkStatus')
        .optional({ nullable: true })
        .isString()
        .withMessage('Trạng thái phải là một chuỗi')
        .bail()
        .isIn(['BALANCED', 'DISCREPANCY'])
        .withMessage('Trạng thái không hợp lệ'),
    body('details')
        .isArray()
        .withMessage('Chi tiết kiểm kê là bắt buộc')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Chi tiết kiểm kê không được để trống');
            }
            return true;
        }),
    body('details.*.batchID').notEmpty().withMessage('Mã lô hàng là bắt buộc').bail(),
    body('details.*.boxID').notEmpty().withMessage('Mã ô là bắt buộc').bail(),
    body('details.*.systemQuantity').isInt({ gte: 0 }).withMessage('Số lượng hệ thống phải lớn hơn hoặc bằng 0').bail(),
    body('details.*.actualQuantity')
        .optional({ nullable: true })
        .isInt({ gte: 0 })
        .withMessage('Số lượng thực tế phải lớn hơn hoặc bằng 0')
        .bail(),
    body('details.*.discrepancyQuantity')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Số lượng chênh lệch phải là một số nguyên')
        .bail(),
];
const updateInventoryCheck = [
    body('inventoryCheckID').notEmpty().withMessage('Mã phiếu kiểm kê là bắt buộc').bail(),
    body('status')
        .optional()
        .isString()
        .withMessage('Trạng thái phải là một chuỗi')
        .bail()
        .isIn(['PENDING', 'PENDING_CHECK', 'COMPLETED', 'REFUSE'])
        .withMessage('Trạng thái không hợp lệ'),
];

const submitInventoryCheck = [
    body('inventoryCheckID').notEmpty().withMessage('Mã phiếu kiểm kê là bắt buộc').bail(),
    body('details')
        .isArray()
        .withMessage('Chi tiết kiểm kê là bắt buộc')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Chi tiết kiểm kê không được để trống');
            }
            return true;
        }),
    body('details.*.inventoryCheckDetailID').notEmpty().withMessage('Mã chi tiết kiểm kê là bắt buộc').bail(),
    body('details.*.actualQuantity').isInt({ gte: 0 }).withMessage('Số lượng thực tế phải lớn hơn hoặc bằng 0').bail(),
];

const filterInventoryCheck = [
    query('status')
        .optional()
        // .isIn(['MATCHED', 'SHORTAGE', 'SURPLUS', ''])
        .isIn(['PENDING', 'PENDING_CHECK', 'COMPLETED', 'REFUSE', ''])
        .withMessage('Trạng thái không hợp lệ')
        .bail(),
    query('checkStatus')
        .optional()
        .isIn(['BALANCED', 'DISCREPANCY', ''])
        .withMessage('Trạng thái kiểm kê thực tế không hợp lệ')
        .bail(),
    query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail(),
];

module.exports = {
    getAllInventoryChecks,
    createInventoryCheck,
    filterInventoryCheck,
    updateInventoryCheck,
    submitInventoryCheck,
};
