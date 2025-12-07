const express = require('express');
const router = express.Router();
const ShelfController = require('../controllers/ShelfController');
const { authUser } = require('../middleware/AuthMiddleware');
const { checkGetAllShelfOfWarehouse } = require('../validates/shelf.validation');
const validate = require('../validates/validate');

router.get(
    '/get-shelf-of-warehouse/:warehouseID',
    checkGetAllShelfOfWarehouse,
    validate,
    authUser,
    ShelfController.getAllShelfOfWarehouse,
);

module.exports = router;
