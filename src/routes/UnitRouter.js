const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/UnitController');

router.get('/get-all', UnitController.getAllUnit);
router.get('/get-by-product/:productID', UnitController.getUnitsByProduct);
router.post('/get-total-valid-amount', UnitController.getTotalValidAmountByProductAndUnit);

module.exports = router;
