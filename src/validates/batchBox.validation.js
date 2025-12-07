const { query, body } = require('express-validator');

const suggestBoxes = [
    body('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail(),
    body('batchIDs')
        .isArray()
        .withMessage('Danh sách batchIDs không hợp lệ')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Danh sách batchIDs không được để trống');
            }
            return true;
        }),
];

const updateLocationBatch = [
    body('warehouseID')
        .notEmpty()
        .withMessage('Mã kho là bắt buộc')
        .isString()
        .withMessage('Mã kho không hợp lệ')
        .bail(),
    body('employeeID').notEmpty().withMessage('Mã nhân viên là bắt buộc').bail(),

    body('locations').isArray({ min: 1 }).withMessage('Danh sách locations không hợp lệ hoặc rỗng').bail(),

    body('locations.*.batchID')
        .notEmpty()
        .withMessage('Mã lô hàng là bắt buộc')
        .isString()
        .withMessage('Mã lô hàng không hợp lệ')
        .bail(),

    body('locations.*.boxes').isArray({ min: 1 }).withMessage('Danh sách ô không hợp lệ hoặc rỗng').bail(),

    body('locations.*.boxes.*.boxID')
        .notEmpty()
        .withMessage('Mã ô là bắt buộc')
        .isString()
        .withMessage('Mã ô không hợp lệ')
        .bail(),

    body('locations.*.boxes.*.quantity')
        .notEmpty()
        .withMessage('Số lượng đặt là bắt buộc')
        .isInt({ min: 1 })
        .withMessage('Số lượng đặt phải là số nguyên > 0')
        .bail(),
];
const changeLocation = [
    // body('warehouseID')
    //     .notEmpty()
    //     .withMessage('Mã kho là bắt buộc')
    //     .isString()
    //     .withMessage('Mã kho không hợp lệ')
    //     .bail(),
    body('boxID').isString().withMessage('Mã ô cũ là bắt buộc').bail(),
    body('employeeID').isString().withMessage('Mã nhân viên là bắt buộc').bail(),

    body('oldLocations').isArray({ min: 1 }).withMessage('Danh sách locations cũ không hợp lệ hoặc rỗng').bail(),

    body('oldLocations.*.batchID')
        .notEmpty()
        .withMessage('Mã lô hàng cũ là bắt buộc')
        .isString()
        .withMessage('Mã lô hàng cũ không được rỗng')
        .bail(),

    body('oldLocations.*.quantity')
        .notEmpty()
        .withMessage('Số lượng đặt còn lại của vị trí cũ là bắt buộc')
        .isInt({ min: 0 })
        .withMessage('Số lượng đặt còn lại của vị trí cũ phải là số nguyên >= 0')
        .bail(),
    body('newLocations').isArray({ min: 1 }).withMessage('Danh sách locations mới không hợp lệ hoặc rỗng').bail(),
    body('newLocations.*.batchID')
        .notEmpty()
        .withMessage('Mã lô hàng là bắt buộc')
        .isString()
        .withMessage('Mã lô hàng không hợp lệ')
        .bail(),
    body('newLocations.*.boxes').isArray({ min: 1 }).withMessage('Danh sách ô không hợp lệ hoặc rỗng').bail(),
    body('newLocations.*.boxes.*.boxID')
        .notEmpty()
        .withMessage('Mã ô là bắt buộc')
        .isString()
        .withMessage('Mã ô không hợp lệ')
        .bail(),

    body('newLocations.*.boxes.*.quantity')
        .notEmpty()
        .withMessage('Số lượng đặt là bắt buộc')
        .isInt({ min: 1 })
        .withMessage('Số lượng đặt phải là số nguyên > 0')
        .bail(),
];

module.exports = {
    suggestBoxes,
    updateLocationBatch,
    changeLocation,
};
