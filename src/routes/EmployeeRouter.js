const express = require('express');
const { authUser, authUserIsManager } = require('../middleware/AuthMiddleware');
const validate = require('../validates/validate');
const EmployeeController = require('../controllers/EmployeeController');
const { checkEmail, checkUpdateEmployee } = require('../validates/employee.validation');
const router = express.Router();
router.get('/', (req, res) => {
    return res.send('EmployeeRouter Router is working!');
});

router.post('/list', authUserIsManager, EmployeeController.getAllEmployee);
router.post('/employee-detail', authUser, checkEmail, validate, EmployeeController.getEmployee);
router.put('/update', authUserIsManager, checkUpdateEmployee, validate, EmployeeController.updateEmployee)
router.get('/filter', authUserIsManager, EmployeeController.searchEmployee)
module.exports = router;
