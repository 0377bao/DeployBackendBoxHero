const express = require('express');
const BoxController = require('../controllers/BoxController');
const router = express.Router();

router.post('/generate-qr', BoxController.generateQR);

module.exports = router;
