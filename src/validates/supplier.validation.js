const { query, body, param } = require('express-validator');
const checkEmailExists = [
    query('email').notEmpty().withMessage('Email là bắt buộc').bail().isEmail().withMessage('Email không hợp lệ'),
];
const checkSupplierValidate = [
    body('supplierID').notEmpty().withMessage('Mã nhà cung cấp là bắt buộc').bail(),
    body('email').notEmpty().withMessage('Email là bắt buộc').bail().isEmail().withMessage('Email không hợp lệ'),
    body('supplierName')
        .notEmpty()
        .withMessage('Tên nhà cung cấp là bắt buộc')
        .bail()
        .isString()
        .withMessage('Tên nhà cung cấp phải là chuỗi'),
    body('address')
        .notEmpty()
        .withMessage('Địa chỉ là bắt buộc')
        .bail()
        .isString()
        .withMessage('Địa chỉ phải là chuỗi'),
    body('phoneNumber')
        .notEmpty()
        .withMessage('Số điện thoại là bắt buộc')
        .bail()
        .isString()
        .withMessage('Số điện thoại phải là một chuỗi')
        .bail()
        .isLength({ min: 10, max: 15 })
        .withMessage('Số điện thoại phải có độ dài từ 10 đến 15 ký tự')
        .bail()
        .custom((value) => {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('Số điện thoại không hợp lệ');
            }
            return true;
        }),
];
const checkSupplierIDValidate = [param('supplierID').notEmpty().withMessage('Mã nhà cung cấp là bắt buộc').bail()];
module.exports = {
    checkEmailExists,
    checkSupplierValidate,
    checkSupplierIDValidate,
};
