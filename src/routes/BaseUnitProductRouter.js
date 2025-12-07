const express = require('express');
const router = express.Router();
const BaseUnitProductController = require('../controllers/BaseUnitProductController');

router.get('/get-all', BaseUnitProductController.getAllBaseUnitProduct);

module.exports = router;
