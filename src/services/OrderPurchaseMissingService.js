const db = require('../../models/index');
const OrderPurchaseMissing = db.OrderPurchaseMissing;
const OrderPurchaseMissingDetail = db.OrderPurchaseMissingDetail;
const Batch = db.Batch;
const OrderPurchaseDetail = db.OrderPurchaseDetail;
const OrderPurchase = db.OrderPurchase;
const Product = db.Product;
const Employee = db.Employee;
const Unit = db.Unit;
const Supplier = db.Supplier;
const dotenv = require('dotenv');
const { Op, where, fn, col } = require('sequelize');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class OrderPurchaseMissingService {
    getAllOrderPurchaseMissing() {
        return new Promise(async (resolve, reject) => {
            try {
                const orderPurchaseMissingFind = await OrderPurchaseMissing.findAll({
                    include: [
                        {
                            model: OrderPurchaseMissingDetail,
                            as: 'orderPurchaseMissingDetails',
                            include: [
                                {
                                    model: OrderPurchaseDetail,
                                    as: 'orderPurchaseDetail',
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                {
                                                    model: Product,
                                                    as: 'product',
                                                },
                                            ],
                                        },
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            attributes: ['batchID', 'qrCode'],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: orderPurchaseMissingFind,
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    getOrderPurchaseMissingById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const orderPurchaseMissingFind = await OrderPurchaseMissing.findByPk(id, {
                    include: [
                        {
                            model: OrderPurchaseMissingDetail,
                            as: 'orderPurchaseMissingDetails',
                            include: [
                                {
                                    model: OrderPurchaseDetail,
                                    as: 'orderPurchaseDetail',
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                {
                                                    model: Product,
                                                    as: 'product',
                                                },
                                                {
                                                    model: Unit,
                                                    as: 'unit',
                                                    attributes: ['unitID', 'unitName'],
                                                },
                                                {
                                                    model: Supplier,
                                                    as: 'supplier',
                                                    attributes: ['supplierID', 'supplierName'],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    model: Batch,
                                    as: 'batch',
                                    attributes: ['batchID', 'qrCode'],
                                },
                            ],
                        },
                    ],
                });
                const orderPurchaseOriginal = await OrderPurchase.findOne({
                    where: {
                        orderPurchaseID: orderPurchaseMissingFind.orderPurchaseID,
                    },
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: {
                        ...orderPurchaseMissingFind.toJSON(),
                        proposalID: orderPurchaseOriginal.toJSON().proposalID,
                    },
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    filterOrderPurchaseMissing(query) {
        return new Promise(async (resolve, reject) => {
            try {
                const limit = 5;
                const {
                    orderPurchaseMissingID,
                    warehouseID,
                    employeeID,
                    employeeName,
                    createdAt,
                    page = 1,
                    ...rest
                } = query;
                const filter = {};
                if (orderPurchaseMissingID) filter.orderPurchaseMissingID = orderPurchaseMissingID;
                const queryEmployee = {};
                if (employeeID) {
                    queryEmployee.employeeID = employeeID;
                }
                if (employeeName) {
                    queryEmployee.employeeName = { [Op.like]: `%${employeeName}%` };
                }
                const date = {};
                if (createdAt)
                    date.createdAt = {
                        [Op.and]: [
                            where(fn('DATE', col('OrderPurchaseMissing.createdAt')), {
                                [Op.eq]: createdAt, // ngày bắt đầu
                            }),
                        ],
                    };
                // sort createdAt desc
                const orderPurchaseMissingFind = await OrderPurchaseMissing.findAll({
                    where: {
                        ...filter,
                        ...rest,
                        ...date,
                    },
                    include: [
                        {
                            model: OrderPurchase,
                            attributes: ['orderPurchaseID', 'warehouseID', 'proposalID'],
                            as: 'orderPurchase',
                            where: { warehouseID },
                            include: [
                                {
                                    model: Employee,
                                    as: 'employee',
                                    where: queryEmployee,
                                },
                            ],
                        },
                        {
                            model: OrderPurchaseMissingDetail,
                            as: 'orderPurchaseMissingDetails',
                            include: [
                                {
                                    model: OrderPurchaseDetail,
                                    as: 'orderPurchaseDetail',
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                {
                                                    model: Product,
                                                    as: 'product',
                                                },
                                                {
                                                    model: Unit,
                                                    as: 'unit',
                                                },
                                                {
                                                    model: Supplier,
                                                    as: 'supplier',
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    model: Batch,
                                    as: 'batch',
                                    attributes: ['batchID', 'qrCode'],
                                },
                            ],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                    limit,
                    offset: (page - 1) * limit,
                });
                const total = await OrderPurchaseMissing.count({
                    where: {
                        ...filter,
                        ...rest,
                        ...date,
                    },
                    include: [
                        {
                            model: OrderPurchase,
                            attributes: ['orderPurchaseID', 'warehouseID'],
                            as: 'orderPurchase',
                            where: { warehouseID },
                            include: [
                                {
                                    model: Employee,
                                    as: 'employee',
                                    where: queryEmployee,
                                },
                            ],
                        },
                        {
                            model: OrderPurchaseMissingDetail,
                            as: 'orderPurchaseMissingDetails',
                            include: [
                                {
                                    model: OrderPurchaseDetail,
                                    as: 'orderPurchaseDetail',
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                {
                                                    model: Product,
                                                    as: 'product',
                                                },
                                                {
                                                    model: Unit,
                                                    as: 'unit',
                                                },
                                                {
                                                    model: Supplier,
                                                    as: 'supplier',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                    limit,
                    offset: (page - 1) * limit,
                });
                const totalPages = Math.ceil(total / limit);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: orderPurchaseMissingFind,
                    pagination: {
                        currentPage: page,
                        totalPages,
                    },
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new OrderPurchaseMissingService();
