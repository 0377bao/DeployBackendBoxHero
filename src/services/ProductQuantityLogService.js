const { Op } = require('sequelize');
const db = require('../../models/index');
const ProductQuantityLog = db.ProductQuantityLog;
const OrderPurchase = db.OrderPurchase;
const OrderRelease = db.OrderRelease;
const Employee = db.Employee;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class ProductQuantityLogService {
    // get all unit
    getLogByProductID({ productID, page = 1 }) {
        return new Promise(async (resolve, reject) => {
            try {
                const limit = 5;
                const productQuantityLog = await ProductQuantityLog.findAll({
                    where: { productID },
                    order: [['createdAt', 'DESC']],
                    limit,
                    offset: (page - 1) * limit,
                });

                const total = await db.ProductQuantityLog.count({ where: { productID } });
                const totalPages = Math.ceil(total / limit);

                for (const log of productQuantityLog) {
                    let employeeName = 'N/A';

                    if (log.actionType === 'PURCHASE') {
                        const order = await OrderPurchase.findOne({
                            where: { orderPurchaseID: log.referenceID },
                            include: [
                                {
                                    model: Employee,
                                    as: 'employee',
                                    attributes: ['employeeName'],
                                },
                            ],
                        });
                        employeeName = order?.employee?.employeeName || 'N/A';
                    } else if (log.actionType === 'RELEASE') {
                        const order = await OrderRelease.findOne({
                            where: { orderReleaseID: log.referenceID },
                            include: [
                                {
                                    model: Employee,
                                    as: 'employees',
                                    attributes: ['employeeName'],
                                },
                            ],
                        });
                        employeeName = order?.employees?.employeeName || 'N/A';
                    } else if (log.actionType === 'INVENTORY_CHECK') {
                        const inventoryCheck = await db.InventoryCheck.findOne({
                            where: { inventoryCheckID: log.referenceID },
                            include: [
                                {
                                    model: Employee,
                                    as: 'employee',
                                    attributes: ['employeeName'],
                                },
                            ],
                        });
                        employeeName = inventoryCheck?.employee?.employeeName || 'N/A';
                    }

                    log.dataValues.employeeName = employeeName;
                }

                resolve({
                    status: 'OK',
                    message: 'Lấy log số lượng sản phẩm thành công',
                    statusHttp: HTTP_OK,
                    data: productQuantityLog,
                    pagination: {
                        currentPage: page,
                        totalPages,
                    },
                });
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }
    // filter
    filterLogByProductID({ employeeCreate, productID, actionType, dateFrom, dateTo, page = 1 }) {
        return new Promise(async (resolve, reject) => {
            const limit = 5;

            try {
                const whereClause = {};

                // Bộ lọc actionType
                if (actionType) {
                    whereClause.actionType = actionType;
                }

                if (productID) {
                    whereClause.productID = productID;
                }

                // Bộ lọc theo thời gian
                if (dateFrom && dateTo) {
                    const startDate = new Date(`${dateFrom}T00:00:00.000Z`);
                    const endDate = new Date(`${dateTo}T23:59:59.999Z`);
                    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
                } else if (dateFrom) {
                    const startDate = new Date(`${dateFrom}T00:00:00.000Z`);
                    whereClause.createdAt = { [Op.gte]: startDate };
                } else if (dateTo) {
                    const endDate = new Date(`${dateTo}T23:59:59.999Z`);
                    whereClause.createdAt = { [Op.lte]: endDate };
                }

                const includes = [
                    {
                        model: db.Product,
                        as: 'product',
                        attributes: ['productID', 'productName'],
                    },
                ];

                if (actionType === 'PURCHASE') {
                    includes.push({
                        model: db.OrderPurchase,
                        as: 'orderPurchase',
                        required: !!employeeCreate,
                        where: employeeCreate ? { employeeID: employeeCreate } : undefined,
                        attributes: ['orderPurchaseID', 'employeeID', 'warehouseID', 'status', 'type'],
                        include: [
                            {
                                model: db.Employee,
                                as: 'employee',
                                attributes: ['employeeName'],
                            },
                            {
                                model: db.Warehouse,
                                as: 'warehouse',
                                attributes: ['warehouseName'],
                            },
                        ],
                    });
                } else if (actionType === 'RELEASE') {
                    includes.push({
                        model: db.OrderRelease,
                        as: 'orderRelease',
                        required: !!employeeCreate,
                        where: employeeCreate ? { employeeID: employeeCreate } : undefined,
                        attributes: ['orderReleaseID', 'employeeID', 'warehouseID', 'customerID'],
                        include: [
                            {
                                model: db.Employee,
                                as: 'employees',
                                attributes: ['employeeName'],
                            },
                            {
                                model: db.Warehouse,
                                as: 'warehouses',
                                attributes: ['warehouseName'],
                            },
                            {
                                model: db.Customer,
                                as: 'customers',
                                attributes: ['customerName'],
                            },
                        ],
                    });
                } else if (actionType === 'INVENTORY_CHECK') {
                    includes.push({
                        model: db.InventoryCheck,
                        as: 'inventoryCheck',
                        required: !!employeeCreate,
                        where: employeeCreate ? { employeeID: employeeCreate } : undefined,
                        attributes: ['inventoryCheckID', 'employeeID', 'warehouseID', 'status', 'checkStatus'],
                        include: [
                            {
                                model: db.Employee,
                                as: 'employee',
                                attributes: ['employeeName'],
                            },
                            {
                                model: db.Warehouse,
                                attributes: ['warehouseName'],
                            },
                        ],
                    });
                } else {
                    // Nếu không lọc theo actionType cụ thể, thêm cả ba quan hệ
                    includes.push(
                        {
                            model: db.OrderPurchase,
                            as: 'orderPurchase',
                            required: false,
                            where: employeeCreate ? { employeeID: employeeCreate } : undefined,
                            attributes: ['orderPurchaseID', 'employeeID', 'warehouseID', 'status', 'type'],
                            include: [
                                {
                                    model: db.Employee,
                                    as: 'employee',
                                    attributes: ['employeeName'],
                                },
                                {
                                    model: db.Warehouse,
                                    as: 'warehouse',
                                    attributes: ['warehouseName'],
                                },
                            ],
                        },
                        {
                            model: db.OrderRelease,
                            as: 'orderRelease',
                            required: false,
                            where: employeeCreate ? { employeeID: employeeCreate } : undefined,
                            attributes: ['orderReleaseID', 'employeeID', 'warehouseID', 'customerID'],
                            include: [
                                {
                                    model: db.Employee,
                                    as: 'employees',
                                    attributes: ['employeeName'],
                                },
                                {
                                    model: db.Warehouse,
                                    as: 'warehouses',
                                    attributes: ['warehouseName'],
                                },
                                {
                                    model: db.Customer,
                                    as: 'customers',
                                    attributes: ['customerName'],
                                },
                            ],
                        },
                        {
                            model: db.InventoryCheck,
                            as: 'inventoryCheck',
                            required: false,
                            where: employeeCreate ? { employeeID: employeeCreate } : undefined,

                            attributes: ['inventoryCheckID', 'employeeID', 'warehouseID', 'status', 'checkStatus'],
                            include: [
                                {
                                    model: db.Employee,
                                    as: 'employee',
                                    attributes: ['employeeName'],
                                },
                                {
                                    model: db.Warehouse,
                                    attributes: ['warehouseName'],
                                },
                            ],
                        },
                    );

                    if (employeeCreate) {
                        whereClause[Op.or] = [
                            { '$orderPurchase.employeeID$': employeeCreate },
                            { '$orderRelease.employeeID$': employeeCreate },
                            { '$inventoryCheck.employeeID$': employeeCreate },
                        ];
                    }
                }

                // 🔹 Truy vấn chính
                const logs = await db.ProductQuantityLog.findAll({
                    where: whereClause,
                    include: includes,
                    order: [['createdAt', 'DESC']],
                    limit,
                    offset: (page - 1) * limit,
                });

                const total = await db.ProductQuantityLog.count({
                    where: whereClause,
                    include: includes,
                    distinct: true,
                });
                const totalPages = Math.ceil(total / limit);

                resolve({
                    status: 'OK',
                    message: 'Lọc log thành công',
                    statusHttp: HTTP_OK,
                    data: logs,
                    pagination: {
                        currentPage: page,
                        totalPages,
                    },
                });
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }
}

module.exports = new ProductQuantityLogService();
