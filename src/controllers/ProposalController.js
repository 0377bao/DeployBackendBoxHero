const ProposalService = require('../services/ProposalService');

class ProposalController {
    async createProposal(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.createProposal(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async updateStatusProposal(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.updateStatusProposal(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async updateProposalDetail(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.updateProposalDetail(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async getProposalByWarehouse(req, res) {
        try {
            const warehouseID = req.headers['warehouseid'];
            const page = req.query.page;
            const { statusHttp, ...response } = await ProposalService.getProposalByWarehouse(warehouseID, page);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async getProposalByEmployee(req, res) {
        try {
            const employeeID = req.headers['employeeid'];
            const page = req.query.page;
            const { statusHttp, ...response } = await ProposalService.getProposalByEmployee(employeeID, page);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async getProposalDetail(req, res) {
        try {
            const proposalID = req.params.id;
            const { statusHttp, ...response } = await ProposalService.getProposalDetail(proposalID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async filterProposal(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.filterProposal(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async getProposalMissing(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.getProposalMissing(req.query);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async createOrderReleaseProposal(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.createOrderReleaseProposal(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async getAllOrderReleaseProposal(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.getAllOrderReleaseProposal(req.query);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async getOrderReleaseProposalDetail(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.getOrderProposalReleaseDetailByID(req.params.id);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async approveOrderReleaseProposal(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.approveOrderReleaseProposal(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async searchOrderReleaseProposal(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.searchOrderReleaseProposal(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async getOrderReleaseProposalsCanApply(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.getOrderReleaseProposalCanApply();
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
}

module.exports = new ProposalController();
