const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/AccountController');
const {
    checkEmailExists,
    checkSignUpValidate,
    checkSignInValidate,
    changePasswordValidate,
} = require('../validates/account.validation');
const validate = require('../validates/validate');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');

router.get('/check-email-exists', checkEmailExists, validate, AccountController.checkEmailExists);
router.post('/sign-up', authUserIsManager, checkSignUpValidate, validate, AccountController.signUp);
router.post('/sign-in', checkSignInValidate, validate, AccountController.signIn);
router.post('/change-password', authUser, changePasswordValidate, validate, AccountController.changePassword);

module.exports = router;
