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

class BatchMoveLogService {
    // filter
    filterLog({ employeeCreate, batchID, actionType, dateFrom, dateTo, page = 1 }) {
        return new Promise(async (resolve, reject) => {
            const limit = 5;

            try {
                const whereClause = {};

                // Bộ lọc actionType
                if (actionType) {
                    whereClause.actionType = actionType;
                }

                if (batchID) {
                    whereClause.batchID = batchID;
                }

                if (employeeCreate) {
                    whereClause.employeeCreate = employeeCreate;
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

                // 🔹 Truy vấn chính
                const logs = await db.BatchMoveLog.findAll({
                    where: whereClause,
                    include: [
                        {
                            model: db.Batch,
                            as: 'batch',
                            include: [
                                {
                                    model: db.Product,
                                    as: 'product',
                                },
                            ],
                        },
                        {
                            model: db.Employee,
                            as: 'creator',
                        },
                        {
                            model: db.Box,
                            as: 'fromBox',
                            include: [
                                {
                                    model: db.Floor,
                                    as: 'floor',
                                    include: [
                                        {
                                            model: db.Shelf,
                                            as: 'shelf',
                                            include: [
                                                {
                                                    model: db.Zone,
                                                    as: 'zone',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: db.BatchMoveDetail,
                            as: 'details',
                            include: [
                                {
                                    model: db.Box,
                                    as: 'toBox',
                                    include: [
                                        {
                                            model: db.Floor,
                                            as: 'floor',
                                            include: [
                                                {
                                                    model: db.Shelf,
                                                    as: 'shelf',
                                                    include: [
                                                        {
                                                            model: db.Zone,
                                                            as: 'zone',
                                                        },
                                                    ],
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

                const total = await db.BatchMoveLog.count({ where: whereClause });
                const totalPages = Math.ceil(total / limit);

                console.log(`Total logs: ${total}, Total pages: ${totalPages}`);

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

module.exports = new BatchMoveLogService();
