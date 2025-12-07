const express = require('express');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');
const ProductController = require('../controllers/ProductController');
const router = express.Router();
// router.get("/", (req, res) => {
//     return res.send("ProductRouter Router is working!");
// });

router.get('/list', authUser, ProductController.getAllProduct);
router.get('/', authUser, ProductController.getProductById);
router.get('/filter', authUser, ProductController.searchProduct);
router.get('/export/:id', authUser, ProductController.getProductCanExport);
router.put('/update/:id', authUserIsManager, ProductController.updateProduct);
router.post('/filter-option', authUser, ProductController.filterProduct);
router.post('/create-product', authUserIsManager, ProductController.createProduct);

module.exports = router;
