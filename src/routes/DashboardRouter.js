const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { getStatisticalInventoryValidation } = require('../validates/dashboard.validation');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');
const validate = require('../validates/validate');

router.get(
    '/statistical-inventory',
    authUser,
    getStatisticalInventoryValidation,
    validate,
    DashboardController.getStatisticalInventory,
);

router.get(
    '/statistical-import-export',
    authUser,
    getStatisticalInventoryValidation,
    validate,
    DashboardController.getStatisticalImportExport,
);

router.get('/statistical-percent-used-warehouse', authUser, DashboardController.getStatisticalPercentUsedWarehouse);

router.get('/statistical-min-stock-product', authUser, DashboardController.getStatisticalMinStockProduct);

router.get('/statistical-product-old', authUser, DashboardController.getTopFineProductExportLow);

router.get('/statistic-product-export-high', authUser, DashboardController.getStaticTopProductExportInWarehouse);

module.exports = router;
