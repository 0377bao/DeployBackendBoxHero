const AccountService = require('../services/AccountService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_OK = process.env.HTTP_OK;

class AccountController {
    // get /check-email-exists
    async checkEmailExists(req, res) {
        try {
            const { email } = req.query;

            const { statusHttp, ...response } = await AccountService.checkEmailExists(email);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }
    // post /sign-up
    async signUp(req, res) {
        try {
            const { statusHttp, ...response } = await AccountService.createAccount(req.body);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [err.message],
            });
        }
    }
    // post /sign-in
    async signIn(req, res) {
        try {
            const { statusHttp, ...response } = await AccountService.loginAccount(req.body);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [err.message],
            });
        }
    }
    // post /change-password
    async changePassword(req, res) {
        try {
            const { statusHttp, ...response } = await AccountService.changePassword(req.body);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [err.message],
            });
        }
    }
}

module.exports = new AccountController();
