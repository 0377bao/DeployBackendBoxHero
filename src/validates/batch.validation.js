const { query } = require('express-validator');

const checkGetListBatchUnit = [
    query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail(),
    query('productID').notEmpty().withMessage('Mã sản phẩm là bắt buộc').bail(),
];
const checkGetBatchNotWithLocation = [query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail()];

const checkGetAvailableBoxes = [query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail()];

const checkGetBoxesContainingProduct = [
    query('productID').notEmpty().withMessage('Mã sản phẩm là bắt buộc').bail(),
    query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail(),
];

const checkGetBoxesContainingBatch = [
    query('batchID').notEmpty().withMessage('Mã lô là bắt buộc').bail(),
    query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail(),
];

const checkGetBoxDetails = [query('boxID').notEmpty().withMessage('Mã box là bắt buộc').bail()];

module.exports = {
    checkGetListBatchUnit,
    checkGetBatchNotWithLocation,
    checkGetAvailableBoxes,
    checkGetBoxesContainingProduct,
    checkGetBoxDetails,
    checkGetBoxesContainingBatch,
};
