const { query } = require('express-validator');

const getStatisticalInventoryValidation = [
    query('type')
        .notEmpty()
        .withMessage('Loại là bắt buộc')
        .bail()
        .isIn(['MONTH', 'YEAR'])
        .withMessage('Loại không hợp lệ'),
    query('year').custom((value, { req }) => {
        if (req.query.type === 'MONTH' && !value) {
            throw new Error('Năm là bắt buộc khi loại là MONTH');
        }
        return true;
    }),
];

module.exports = {
    getStatisticalInventoryValidation,
};
