const express = require('express');
const router = express.Router();
const InventoryCheckController = require('../controllers/InventoryCheckController');
const { authUserIsManager, authUserIsManagerOrAccountant } = require('../middleware/AuthMiddleware');
const validate = require('../validates/validate');
const {
    getAllInventoryChecks,
    createInventoryCheck,
    filterInventoryCheck,
    updateInventoryCheck,
    submitInventoryCheck,
} = require('../validates/inventoryCheck.validation');
router.get('/', (req, res) => {
    return res.send('InventoryCheckRouter Router is working!');
});

router.get(
    '/get-all-inventory-checks',
    getAllInventoryChecks,
    validate,
    authUserIsManagerOrAccountant,
    InventoryCheckController.getListInventoryCheck,
);

router.post(
    '/create-inventory-checks',
    createInventoryCheck,
    validate,
    authUserIsManagerOrAccountant,
    InventoryCheckController.createInventoryCheck,
);

router.post(
    '/update-inventory-checks',
    updateInventoryCheck,
    validate,
    authUserIsManager,
    InventoryCheckController.updateInventoryCheck,
);

router.post(
    '/submit-inventory-checks',
    submitInventoryCheck,
    validate,
    authUserIsManagerOrAccountant,
    InventoryCheckController.submitInventoryCheck,
);

router.get(
    '/filter-inventory-checks',
    filterInventoryCheck,
    validate,
    authUserIsManagerOrAccountant,
    InventoryCheckController.filterInventoryCheck,
);

module.exports = router;
