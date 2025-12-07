const db = require('../../models/index');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('./JwtService');
const CategoryProduct = db.Category;
const dotenv = require('dotenv');
const { where } = require('sequelize');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

const LIMIT_PAGE = 5;

class CategoryProductService {
    createCategory(newCategory) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { categoryID, categoryName } = newCategory;

                // Check email tồn tại
                const categoryFind = await CategoryProduct.findOne({ where: { categoryID } });
                if (categoryFind) {
                    resolve({
                        statusHttp: HTTP_BAD_REQUEST,
                        status: 'ERR',
                        message: 'Mã loại sản phẩm đã tồn tại',
                    });
                }

                await CategoryProduct.create(
                    {
                        categoryID,
                        categoryName,
                    },
                    { transaction },
                );

                await transaction.commit();
                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: 'Tạo danh mục sản phẩm thành công',
                });
            } catch (e) {
                await transaction.rollback();
                console.log(e);
                reject(e);
            }
        });
    }
    getAllCategories(page) {
        return new Promise(async (resolve, reject) => {
            try {
                const currentPage = page ?? 1;
                const { count, rows: categories } = await CategoryProduct.findAndCountAll({
                    order: [['createdAt', 'DESC']],
                    offset: (page - 1) * LIMIT_PAGE,
                    limit: LIMIT_PAGE,
                });

                const totalPages = Math.ceil(count / LIMIT_PAGE);

                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    data: categories,
                    pagination: {
                        totalPages,
                        currentPage: Number.parseInt(currentPage),
                    },
                });
            } catch (e) {
                console.log(e);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: e,
                });
            }
        });
    }
    searchCategoryProduct(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { categoryID } = data;
                const result = await CategoryProduct.findOne({
                    where: {
                        categoryID,
                    },
                });
                if (!result) {
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Danh mục sản phẩm không tồn tại',
                        data: null,
                    });
                    return;
                }

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tìm kiếm danh mục sản phẩm thành công',
                    data: result,
                });
            } catch (err) {
                console.log(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
    getAllCategoriesForCreateProduct() {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await CategoryProduct.findAll({
                    attributes: ['categoryID', 'categoryName'],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh mục sản phẩm thành công',
                    data: result,
                });
            } catch (err) {
                console.log(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
}

module.exports = new CategoryProductService();
