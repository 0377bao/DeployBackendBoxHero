const EmployeeService = require('../services/EmployeeService');

class EmployeeController {
    // post /employee-detail
    async getEmployee(req, res) {
        try {
            const employeeID = req.headers['employeeid'];
            const { statusHttp, ...response } = await EmployeeService.findEmployee(employeeID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.log(err);
            return res.status(err.statusHttp).json({
                status: 'ERR',
                message: [[err.message]],
            });
        }
    }
    async getAllEmployee(req, res) {
        try {
            const { employeeID } = req.body;
            const { statusHttp, ...response } = await EmployeeService.findAllEmployee(employeeID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json({
                status: 'ERR',
                message: [[err.message]],
            });
        }
    }
    async updateEmployee(req, res) {
        try {
            const { statusHttp, ...response } = await EmployeeService.updateEmployee(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json({
                status: 'ERR',
                message: [[err.message]],
            });
        }
    }
    async searchEmployee(req, res) {
        try {
            const adminId = req.headers['employeeid'];
            console.log(adminId);
            const { statusHttp, ...response } = await EmployeeService.searchEmployee(adminId, req.query);
            console.log(statusHttp);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json({
                status: 'ERR',
                message: [[err.message]],
            });
        }
    }
}

module.exports = new EmployeeController();
