const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');
const { authUser } = require('../middleware/AuthMiddleware');

router.get('/find/:id', CustomerController.findCustomerById);
router.get('/list', CustomerController.getAllCustomers);
router.post('/history-customer', authUser, CustomerController.getHistoryOrderOfCustomer);
router.post('/filter', CustomerController.filterCustomer);
router.get('/list-not-pagination', CustomerController.getAllCustomersNotPagination);

module.exports = router;
