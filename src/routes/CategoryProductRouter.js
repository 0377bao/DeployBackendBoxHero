const express = require('express');
const router = express.Router();
const CategoryProductController = require('../controllers/CategoryProductController');
const { checkCreateCategoryProductValidate } = require('../validates/categoryProduct.validation');
const { authUserIsManagerWithoutWarehouse, authUser } = require('../middleware/AuthMiddleware');
const validate = require('../validates/validate');

router.post(
    '/create-category',
    authUserIsManagerWithoutWarehouse,
    checkCreateCategoryProductValidate,
    validate,
    CategoryProductController.createCategory,
);

router.get('/get-all-categories', authUserIsManagerWithoutWarehouse, CategoryProductController.getAllCategories);

router.get(
    '/all-categories-create-product',
    authUserIsManagerWithoutWarehouse,
    CategoryProductController.getAllCategoriesForProduct,
);

router.post('/search-category', authUser, CategoryProductController.searchCategory);

module.exports = router;
