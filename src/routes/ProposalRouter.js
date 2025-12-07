const express = require('express');
const {
    authUserIsManager,
    authUser,
    authUserIsManagerOrStockReceiver,
    authUserIsManagerOrStockDispatcher,
} = require('../middleware/AuthMiddleware');
const ProposalController = require('../controllers/ProposalController');
const {
    checkCreateProposal,
    checkUpdateStatusProposal,
    checkUpdateProposalDetail,
    checkCreateOrderReleaseProposal,
    checkStatusOrderReleaseProposal,
} = require('../validates/proposal.validation');
const validate = require('../validates/validate');
const router = express.Router();

router.post(
    '/create-proposal',
    checkCreateProposal,
    validate,
    authUserIsManagerOrStockReceiver,
    ProposalController.createProposal,
);
router.post(
    '/update-status-proposal',
    checkUpdateStatusProposal,
    validate,
    authUserIsManager,
    ProposalController.updateStatusProposal,
);
router.post(
    '/update-proposal-detail',
    checkUpdateProposalDetail,
    validate,
    authUser,
    ProposalController.updateProposalDetail,
);
router.get('/get-proposal/warehouse', authUserIsManagerOrStockReceiver, ProposalController.getProposalByWarehouse);
router.get('/get-proposal/employee', authUserIsManagerOrStockReceiver, ProposalController.getProposalByEmployee);
router.get('/get-proposal-detail/:id', authUserIsManagerOrStockReceiver, ProposalController.getProposalDetail);
router.get('/get-proposal-missing', authUserIsManagerOrStockReceiver, ProposalController.getProposalMissing);

router.post('/filter-proposal', authUserIsManagerOrStockReceiver, ProposalController.filterProposal);

router.post(
    '/create-release-proposal',
    authUserIsManagerOrStockDispatcher,
    checkCreateOrderReleaseProposal,
    validate,
    ProposalController.createOrderReleaseProposal,
);

router.get('/get-release-proposal', authUserIsManagerOrStockDispatcher, ProposalController.getAllOrderReleaseProposal);
router.get(
    '/get-release-proposal-detail/:id',
    authUserIsManagerOrStockDispatcher,
    ProposalController.getOrderReleaseProposalDetail,
);
router.get(
    '/get-release-order-proposals-can-apply',
    authUserIsManagerOrStockDispatcher,
    ProposalController.getOrderReleaseProposalsCanApply,
);
router.post(
    '/approve-release-proposal',
    authUserIsManager,
    checkStatusOrderReleaseProposal,
    validate,
    ProposalController.approveOrderReleaseProposal,
);
router.post(
    '/search-release-proposal',
    authUserIsManagerOrStockDispatcher,
    ProposalController.searchOrderReleaseProposal,
);

module.exports = router;
