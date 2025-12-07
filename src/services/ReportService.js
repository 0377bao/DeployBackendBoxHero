const dotenv = require('dotenv');
const { fn, col } = require('sequelize');
const db = require('../../models');
const Product = db.Product;
const Batch = db.Batch;
const Category = db.Category;
const Unit = db.Unit;
const BaseUnitProduct = db.BaseUnitProduct;

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_FORBIDDEN = process.env.HTTP_FORBIDDEN;
//const LIMIT_PAGE = parseInt(process.env.LIMIT_PAGE, 10);
const LIMIT_PAGE = 5;

class ReportService {
    async reportStockWarehouse(data = {}) {
        console.log('data cua toi', data);
        return new Promise(async (resolve, reject) => {
            try {
                let { quarter = '', year = '' } = data;
                const now = new Date();
                if (!quarter) {
                    quarter = Math.floor(now.getMonth() / 3) + 1;
                }
                if (!year) {
                    year = now.getFullYear();
                }
                const result = await Batch.findAll({
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['productID'],
                            include: [
                                {
                                    model: Category,
                                    as: 'category',
                                    attributes: ['categoryID', 'categoryName'],
                                },
                                {
                                    model: BaseUnitProduct,
                                    as: 'baseUnitProducts',
                                    attributes: ['baseUnitProductID', 'baseUnitName'],
                                },
                            ],
                        },
                        {
                            model: Unit,
                            as: 'unit',
                            attributes: ['unitID', 'unitName', 'conversionQuantity'],
                        },
                    ],
                    attributes: [
                        [fn('YEAR', col('batch.createdAt')), 'year'],
                        [fn('QUARTER', col('batch.createdAt')), 'quarter'],
                        [col('product.productID'), 'productID'],
                        [col('product.productName'), 'productName'],
                        [fn('SUM', col('remainAmount')), 'totalRemain'],
                    ],
                    where: db.sequelize.literal(
                        `YEAR(Batch.createdAt) = ${year} AND QUARTER(Batch.createdAt) = ${quarter}`,
                    ),
                    group: [
                        fn('YEAR', col('batch.createdAt')),
                        fn('QUARTER', col('batch.createdAt')),
                        col('product.productID'),
                        col('product.productName'),
                    ],
                    order: [
                        [fn('YEAR', col('createdAt')), 'ASC'],
                        [fn('QUARTER', col('createdAt')), 'ASC'],
                    ],
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Thống kê tồn kho theo quý',
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

module.exports = new ReportService();
