const CustomerService = require('../services/CustomerService');

class CustomerController {
    async getAllCustomers(req, res) {
        try {
            const { statusHttp, ...response } = await CustomerService.getAllCustomers(req.query.page);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async findCustomerById(req, res) {
        const { id } = req.params;
        try {
            const { statusHttp, ...response } = await CustomerService.findCustomerById(id);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async filterCustomer(req, res) {
        try {
            const { statusHttp, ...response } = await CustomerService.filterCustomer(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async getHistoryOrderOfCustomer(req, res) {
        try {
            const { statusHttp, ...response } = await CustomerService.getHistoryOrderOfCustomer(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
}

module.exports = new CustomerController();
