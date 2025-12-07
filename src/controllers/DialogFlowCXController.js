const { default: dialogFlowConstant } = require('../constants/DialogFlowCXFlag');
const dotenv = require('dotenv');
const DialogFlowCXService = require('../services/DialogFlowCXService');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_OK = process.env.HTTP_OK;

class DialogFlowCXController {
    async handleDialogFlowCXCall(req, res) {
        try {
            const tag = req.body.fulfillmentInfo.tag;
            const params = req.body.sessionInfo.parameters;
            const fullSessionPath = req.body.sessionInfo.session;
            const parts = fullSessionPath.split('/');
            const sessionIdFromDF = parts[parts.length - 1];

            switch (tag) {
                case dialogFlowConstant.CHECK_INVENTORY_PRODUCT: {
                    const { product_code } = params; // Use params as needed

                    const response = await DialogFlowCXService.checkInventoryProduct(product_code);
                    return res.status(HTTP_OK).json(response);
                }
                case dialogFlowConstant.BATCH_OF_PRODUCT: {
                    const { product_code } = params;

                    const response = await DialogFlowCXService.batchOfProduct(product_code);
                    return res.status(HTTP_OK).json(response);
                }
                case dialogFlowConstant.INVENTORY_LOW: {
                    const response = await DialogFlowCXService.inventoryLow();
                    return res.status(HTTP_OK).json(response);
                }
                case dialogFlowConstant.CREATE_PROPOSAL_FOR_LOW_INVENTORY: {
                    const { employee_code = 'EP1', number_proposal, proposal_suggested } = params;

                    console.log(employee_code, number_proposal, proposal_suggested);

                    const response = await DialogFlowCXService.createProposalForInventoryLow(
                        employee_code,
                        number_proposal,
                        proposal_suggested,
                    );
                    return res.status(HTTP_OK).json(response);
                }
                case dialogFlowConstant.PRODUCT_ABOUT_TO_EXPIRE: {
                    const response = await DialogFlowCXService.productAboutToExpire();
                    return res.status(HTTP_OK).json(response);
                }
                case dialogFlowConstant.INIT_USER_SESSION: {
                    const response = await DialogFlowCXService.initUserSessionViaWebhook(sessionIdFromDF);
                    return res.status(HTTP_OK).json(response);
                }
                default: {
                    const response = await DialogFlowCXService.default();
                    return res.status(HTTP_OK).json(response);
                }
            }
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }
    async chatWithDialogFlowCX(req, res) {
        try {
            const { message, sessionId } = req.body;
            console.log(message);

            const { statusHttp, ...response } = await DialogFlowCXService.chatWithDialogFlowCX(message, sessionId);
            return res.status(statusHttp).json(response);
        } catch (e) {
            return res.status(e.statusHttp).json(e);
        }
    }
    async initUserSession(req, res) {
        try {
            const employeeID = req.headers['employeeid'];
            const token = req.headers.token;

            const accessToken = token.split(' ')[1];

            const { statusHttp, ...response } = await DialogFlowCXService.initUserSession(employeeID, accessToken);
            return res.status(statusHttp).json(response);
        } catch (e) {
            return res.status(e.statusHttp).json(e);
        }
    }
}

module.exports = new DialogFlowCXController();
