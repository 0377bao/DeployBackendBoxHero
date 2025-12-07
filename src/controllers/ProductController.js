const ProductService = require('../services/ProductService');

class ProductController {
    async getProductById(req, res) {
        try {
            console.log(1);
            const { productID } = req.query;
            const warehouseID = req.headers['warehouseid'];
            const { statusHttp, ...response } = await ProductService.findProductById(productID, warehouseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async getAllProduct(req, res) {
        console.log(2);
        const { page, ...rest } = req.query;
        try {
            const { statusHttp, ...response } = await ProductService.findAllProduct(page, rest);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async searchProduct(req, res) {
        try {
            const { statusHttp, ...response } = await ProductService.searchProduct(req.query);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async updateProduct(req, res) {
        try {
            const productID = req.params.id;
            const { statusHttp, ...response } = await ProductService.updateProduct({
                productID,
                ...req.body,
            });
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async filterProduct(req, res) {
        try {
            const { statusHttp, ...response } = await ProductService.filterProduct(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async createProduct(req, res) {
        try {
            const { statusHttp, ...response } = await ProductService.createProduct(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async getProductCanExport(req, res) {
        try {
            const productID = req.params.id;
            const { statusHttp, ...response } = await ProductService.getProductCanExport(productID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
}

module.exports = new ProductController();
