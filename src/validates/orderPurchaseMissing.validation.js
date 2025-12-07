const { query, body } = require('express-validator');

const checkFilter = [
    query('warehouseID')
        .notEmpty()
        .withMessage('warehouseID là bắt buộc')
        .bail()
        .isString()
        .withMessage('warehouseID phải là một chuỗi'),
];

module.exports = {
    checkFilter,
};
