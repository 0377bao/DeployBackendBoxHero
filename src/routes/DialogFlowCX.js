const express = require('express');
const DialogFlowCXController = require('../controllers/DialogFlowCXController');
const { authUser } = require('../middleware/AuthMiddleware');
const router = express.Router();

router.post('/', DialogFlowCXController.handleDialogFlowCXCall);
router.post('/chat', DialogFlowCXController.chatWithDialogFlowCX);
router.post('/init', authUser, DialogFlowCXController.initUserSession);

module.exports = router;
