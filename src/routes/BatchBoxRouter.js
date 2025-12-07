const express = require('express');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');
const { suggestBoxes, updateLocationBatch, changeLocation } = require('../validates/batchBox.validation');
const validate = require('../validates/validate');
const BatchBoxController = require('../controllers/BatchBoxController');
const router = express.Router();

router.post('/suggest-boxes', authUserIsManager, suggestBoxes, validate, BatchBoxController.suggestBoxes);
router.post(
    '/update-location-batch',
    authUserIsManager,
    updateLocationBatch,
    validate,
    BatchBoxController.updateLocationBatch,
);
router.post('/change-location-batch', authUserIsManager, changeLocation, validate, BatchBoxController.changeLocation);
router.get('/get-all-box-by-batch-id', authUser, BatchBoxController.getAllBoxByBatchID);
module.exports = router;
