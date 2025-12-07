const { query, body, param } = require('express-validator');

const checkWarehouse = [
    body('warehouseID').notEmpty().withMessage('Mã kho bắt buộc').bail().isString().withMessage('Mã kho phải là chuỗi'),
    body('warehouseName').notEmpty().withMessage('Tên kho bắt buộc').bail().isString('Tên kho phải là chuỗi'),
    body('faxNumber')
        .notEmpty()
        .withMessage('Số điện thoại bắt buộc')
        .bail()
        .isMobilePhone('vi-VN')
        .withMessage('Số điện không hợp lệ'),
    body('address').notEmpty().withMessage('Địa chỉ bắt buộc').bail().isString('Địa chỉ phải là chuỗi'),
    body('status')
        .notEmpty()
        .withMessage('Trạng thái kho bắt buộc')
        .bail()
        .custom((value, { req }) => {
            const statusWarehouse = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'];
            if (!statusWarehouse.includes(req.body.status)) {
                throw new Error('Trạng thái kho không hợp lệ');
            }
            return true;
        }),
];

const checkGetDetail = [
    param('id').notEmpty().withMessage('ID kho bắt buộc').bail().isString().withMessage('ID kho phải là chuỗi'),
];

module.exports = { checkWarehouse, checkGetDetail };
