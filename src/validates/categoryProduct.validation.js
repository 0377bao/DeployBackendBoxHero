const { body } = require('express-validator');

const checkCreateCategoryProductValidate = [
    body('categoryID')
        .notEmpty()
        .withMessage('Mã loại sản phẩm là bắt buộc')
        .bail()
        .matches(/^CA.{5}$/)
        .withMessage('Mã loại sản phẩm phải bắt đầu bằng "CA" và theo sau là 5 ký tự'),
    body('categoryName').notEmpty().withMessage('Tên loại sản phẩm là bắt buộc'),
];

module.exports = {
    checkCreateCategoryProductValidate,
};
