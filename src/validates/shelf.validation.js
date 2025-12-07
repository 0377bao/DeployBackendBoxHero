const { param } = require('express-validator');

const checkGetAllShelfOfWarehouse = [param('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail()];

module.exports = {
    checkGetAllShelfOfWarehouse,
};
