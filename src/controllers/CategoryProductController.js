const CategoryProductService = require('../services/CategoryProductService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class CategoryProductController {
    // post /create-category
    async createCategory(req, res) {
        try {
            const { statusHttp, ...response } = await CategoryProductService.createCategory(req.body);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [err.message],
            });
        }
    }

    // get /get-all-categories
    async getAllCategories(req, res) {
        try {
            const { statusHttp, ...response } = await CategoryProductService.getAllCategories(req.query.page);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }
    async searchCategory(req, res) {
        try {
            const { statusHttp, ...response } = await CategoryProductService.searchCategoryProduct(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            const { statusHttp, ...response } = err;
            return res.status(err.statusHttp).json(response);
        }
    }
    async getAllCategoriesForProduct(req, res) {
        try {
            const { statusHttp, ...response } = await CategoryProductService.getAllCategoriesForCreateProduct();
            return res.status(statusHttp).json(response);
        } catch (err) {
            const { statusHttp, ...response } = err;
            return res.status(err.statusHttp).json(response);
        }
    }
}

module.exports = new CategoryProductController();
