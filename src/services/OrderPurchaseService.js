const { where, Op, fn, col, Sequelize } = require('sequelize');
const db = require('../../models/index');
const Batch = db.Batch;
const ProductQuantityLog = db.ProductQuantityLog;
const OrderPurchaseDetail = db.OrderPurchaseDetail;
const Product = db.Product;
const OrderPurchaseMissing = db.OrderPurchaseMissing;
const OrderPurchaseMissingDetail = db.OrderPurchaseMissingDetail;
const Proposal = db.Proposal;
const OrderPurchase = db.OrderPurchase;
const Unit = db.Unit;
const Supplier = db.Supplier;
const Warehouse = db.Warehouse;
const Employee = db.Employee;
const dotenv = require('dotenv');
const { generateQRURL, generateBatchID } = require('../common');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class OrderPurchaseService {
    getAllOrderPurchase({ page = 1 }) {
        return new Promise(async (resolve, reject) => {
            const LIMIT_PAGE = 5;
            try {
                const response = await OrderPurchase.findAll({
                    order: [['createdAt', 'DESC']],
                    include: [
                        { model: Employee, as: 'employee' },
                        { model: Warehouse, as: 'warehouse' },
                        {
                            model: OrderPurchaseDetail,
                            as: 'orderPurchaseDetail',
                            include: [
                                {
                                    model: Batch,
                                    as: 'batch',
                                    include: [
                                        { model: Product, as: 'product' },
                                        { model: Unit, as: 'unit' },
                                        { model: Supplier, as: 'supplier' },
                                    ],
                                },
                            ],
                        },
                    ],
                    limit: LIMIT_PAGE,
                    offset: (page - 1) * LIMIT_PAGE,
                });
                const total = await db.OrderPurchase.count();
                const totalPages = Math.ceil(total / LIMIT_PAGE);
                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: 'Lấy danh sách đơn nhập hàng thành công',
                    data: response,
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
    filterOrderPurchase({
        page = 1,
        code,
        createdAt,
        employeeName,
        type,
        status,
        originalOrderPurchaseID,
        proposalID,
    }) {
        return new Promise(async (resolve, reject) => {
            const queryEmployee = {};
            const filterOptions = {};
            const date = {};

            console.log(status);
            console.log(code);
            if (code) {
                filterOptions.orderPurchaseID = code;
            }
            if (createdAt)
                date.createdAt = {
                    [Op.and]: [
                        where(fn('DATE', col('OrderPurchase.createdAt')), {
                            [Op.eq]: createdAt, // ngày bắt đầu
                        }),
                    ],
                };
            if (employeeName) {
                queryEmployee.employeeName = { [Op.like]: `%${employeeName}%` };
            }
            if (type) {
                filterOptions.type = type;
            }
            if (originalOrderPurchaseID) {
                filterOptions.originalOrderPurchaseID = originalOrderPurchaseID;
            }
            if (proposalID) {
                filterOptions.proposalID = proposalID;
            }
            if (status) {
                filterOptions.status = status;
            }
            const LIMIT_PAGE = 5;
            try {
                const response = await OrderPurchase.findAll({
                    where: { ...filterOptions, ...date },
                    order: [['createdAt', 'DESC']],
                    include: [
                        { model: Employee, as: 'employee', where: queryEmployee },
                        { model: Warehouse, as: 'warehouse' },
                        {
                            model: OrderPurchaseDetail,
                            as: 'orderPurchaseDetail',
                            include: [
                                {
                                    model: Batch,
                                    as: 'batch',
                                    include: [
                                        { model: Product, as: 'product' },
                                        { model: Unit, as: 'unit' },
                                        { model: Supplier, as: 'supplier' },
                                    ],
                                },
                            ],
                        },
                    ],
                    limit: LIMIT_PAGE,
                    offset: (page - 1) * LIMIT_PAGE,
                });
                const total = await db.OrderPurchase.count({
                    where: { ...filterOptions, ...date },
                    include: [{ model: Employee, as: 'employee', where: queryEmployee }],
                });
                const totalPages = Math.ceil(total / LIMIT_PAGE);

                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: 'Lấy danh sách đơn nhập hàng thành công',
                    data: response,
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
    createOrderPurchase(newOrder) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const {
                    orderPurchaseID,
                    employeeID,
                    note,
                    warehouseID,
                    status,
                    orderReturnID,
                    proposalID,
                    orderPurchaseDetails,
                    type,
                    originalOrderPurchaseID,
                } = newOrder;

                // Check orderPurchase tồn tại
                const orderPurchaseFind = await OrderPurchase.findOne({ where: { orderPurchaseID } });
                if (orderPurchaseFind) {
                    resolve({
                        statusHttp: HTTP_BAD_REQUEST,
                        status: 'ERR',
                        message: 'Đơn nhập hàng đã tồn tại',
                    });
                }

                // check proposal exists
                if (proposalID) {
                    const proposalFind = await Proposal.findOne({ where: { proposalID } });
                    if (!proposalFind) {
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Đề xuất không tồn tại',
                        });
                    }
                }

                const objCreate = {
                    orderPurchaseID,
                    employeeID,
                    note,
                    warehouseID,
                    orderReturnID,
                    proposalID,
                };

                if (status) {
                    objCreate.status = status;
                }

                // save orderPurchase
                const newOrderPurchase = await OrderPurchase.create(
                    {
                        ...objCreate,
                    },
                    { transaction },
                );

                // check and create orderPurchaseMissing
                if (status === 'INCOMPLETE') {
                    const qrCode = await generateQRURL(orderPurchaseID);
                    const orderPurchaseMissing = await OrderPurchaseMissing.create(
                        {
                            orderPurchaseMissingID: orderPurchaseID,
                            orderPurchaseID: orderPurchaseID,
                            note: note,
                            status: 'PENDING',
                            qrCode,
                        },
                        { transaction },
                    );
                }

                if (type == 'SUPPLEMENT') {
                    // check originalOrderPurchaseID exists
                    const originalOrderPurchaseFind = await OrderPurchase.findOne({
                        where: { orderPurchaseID: originalOrderPurchaseID },
                    });

                    // check orderMissingPurchaseID exists
                    const orderMissingPurchaseFind = await OrderPurchaseMissing.findOne({
                        where: { orderPurchaseID: originalOrderPurchaseID },
                    });
                    if (!originalOrderPurchaseFind) {
                        await transaction.rollback();
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Đơn nhập hàng gốc không tồn tại',
                        });
                    } else if (!orderMissingPurchaseFind) {
                        await transaction.rollback();
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Đơn nhập hàng gốc không có đơn nhập hàng thiếu',
                        });
                    } else if (
                        originalOrderPurchaseFind.status === 'COMPLETED' ||
                        originalOrderPurchaseFind.status === 'CANCELED'
                    ) {
                        await transaction.rollback();
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Đơn nhập hàng gốc đã hoàn thành hoặc đã hủy, không thể tạo phiếu nhập bổ sung',
                        });
                    } else {
                        // update type
                        await newOrderPurchase.update({ type: 'SUPPLEMENT', originalOrderPurchaseID }, { transaction });
                        // update original order purchase status to COMPLETED
                        await originalOrderPurchaseFind.update({ status: 'COMPLETED' }, { transaction });
                        // update orderPurchaseMissing status to RESOLVED
                        await orderMissingPurchaseFind.update({ status: 'RESOLVED' }, { transaction });
                    }
                }

                // loop orderPurchaseDetails
                for (const orderPurchaseDetail of orderPurchaseDetails) {
                    const batchID = orderPurchaseDetail.batchID;
                    const batchFind = await Batch.findOne({ where: { batchID } });

                    if (!batchFind) {
                        await transaction.rollback();
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Lô không tồn tại',
                        });
                    }

                    // check unit exists
                    const unitFind = await Unit.findOne({ where: { unitID: orderPurchaseDetail.unitID } });

                    if (!unitFind) {
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Đơn vị không tồn tại',
                        });
                    }

                    // check product exists
                    const productID = orderPurchaseDetail.productID;
                    const productFind = await Product.findOne({ where: { productID } });

                    if (!productFind) {
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Sản phẩm không tồn tại',
                        });
                    }

                    // update amount product
                    const amountConvert = unitFind.conversionQuantity * orderPurchaseDetail.actualQuantity;
                    await Product.update(
                        {
                            amount: Sequelize.literal(`amount + ${amountConvert}`),
                        },
                        {
                            where: { productID: orderPurchaseDetail.productID },
                            transaction,
                        },
                    );

                    // update product quantity log
                    await ProductQuantityLog.create(
                        {
                            actionType: 'PURCHASE',
                            quantityChange: amountConvert,
                            previousAmount: productFind.amount,
                            newAmount: productFind.amount + amountConvert,
                            referenceID: orderPurchaseID,
                            note: `Nhập kho từ đơn ${orderPurchaseID}`,
                            productID: productID,
                        },
                        { transaction },
                    );

                    // check supplier exists
                    const supplierFind = await Supplier.findOne({
                        where: { supplierID: orderPurchaseDetail.supplierID },
                    });

                    if (!supplierFind) {
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Nhà cung cấp không tồn tại',
                        });
                    }

                    // check warehouse exists
                    const warehouseFind = await Warehouse.findOne({
                        where: { warehouseID: warehouseID },
                    });

                    if (!warehouseFind) {
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Kho không tồn tại',
                        });
                    }

                    // save batch
                    await Batch.update(
                        {
                            batchID,
                            manufactureDate: orderPurchaseDetail.manufactureDate,
                            expiryDate: orderPurchaseDetail.expiryDate,
                            importAmount: orderPurchaseDetail.actualQuantity,
                            tempAmount: orderPurchaseDetail.actualQuantity,
                            remainAmount: orderPurchaseDetail.actualQuantity,
                            productID: orderPurchaseDetail.productID,
                            supplierID: orderPurchaseDetail.supplierID,
                            unitID: orderPurchaseDetail.unitID,
                            warehouseID: warehouseID,
                            status: 'AVAILABLE',
                        },

                        { where: { batchID }, transaction },
                    );

                    // save order purchase detail
                    const orderPurchaseDetailItem = await OrderPurchaseDetail.create(
                        {
                            orderPurchaseID: orderPurchaseID,
                            batchID: batchID,
                            requestedQuantity: orderPurchaseDetail.requestedQuantity,
                            actualQuantity: orderPurchaseDetail.actualQuantity,
                            defectiveQuantity: Math.abs(
                                orderPurchaseDetail.requestedQuantity - orderPurchaseDetail.actualQuantity,
                            ),
                        },
                        { transaction },
                    );

                    // check status and save orderPurchaseMissingDetail
                    if (
                        status === 'INCOMPLETE' &&
                        orderPurchaseDetail.requestedQuantity > orderPurchaseDetail.actualQuantity
                    ) {
                        // create new batch suggest for order purchase missing detail
                        const count = await Batch.count();
                        //const batchID = generateBatchID('B', count + 1);
                        const batchID = generateBatchID('B', Math.floor(Math.random() * (1000 - 60 + 1)) + 60);
                        const qrCode = await generateQRURL(batchID);
                        const batchSuggest = await Batch.create(
                            {
                                batchID,
                                productID: orderPurchaseDetail.productID,
                                supplierID: orderPurchaseDetail.supplierID,
                                unitID: orderPurchaseDetail.unitID,
                                warehouseID: warehouseID,
                                status: 'WAITING_IMPORT',
                                qrCode,
                            },
                            { transaction },
                        );
                        await OrderPurchaseMissingDetail.create(
                            {
                                orderPurchaseMissingID: orderPurchaseID,
                                orderPurchaseDetailID: orderPurchaseDetailItem.orderPurchaseDetailID,
                                missingQuantity:
                                    orderPurchaseDetailItem.requestedQuantity - orderPurchaseDetailItem.actualQuantity,
                                batchID: batchSuggest.batchID,
                            },
                            { transaction },
                        );
                    }
                }

                // update status proposal
                await Proposal.update({ status: 'COMPLETED' }, { where: { proposalID: proposalID }, transaction });

                await transaction.commit();
                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: 'Tạo đơn nhập hàng thành công',
                });
            } catch (e) {
                await transaction.rollback();
                console.log(e);
                reject(e);
            }
        });
    }
    updateStatusOrderPurchase(completeOrder) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { orderPurchaseID, status } = completeOrder;

                // Check orderPurchase tồn tại
                const orderPurchaseFind = await OrderPurchase.findOne({ where: { orderPurchaseID } });
                const orderPurchaseMissingFind = await OrderPurchaseMissing.findOne({
                    where: { orderPurchaseID },
                    include: [{ model: OrderPurchaseMissingDetail, as: 'orderPurchaseMissingDetails' }],
                });
                if (!orderPurchaseFind) {
                    return resolve({
                        statusHttp: HTTP_OK,
                        status: 'OK',
                        message: 'Đơn nhập hàng không tồn tại',
                    });
                } else if (!orderPurchaseMissingFind) {
                    return resolve({
                        statusHttp: HTTP_OK,
                        status: 'OK',
                        message: 'Đơn nhập hàng thiếu không tồn tại',
                    });
                } else if (orderPurchaseFind.status === 'CANCELED' || orderPurchaseFind.status === 'COMPLETED') {
                    return resolve({
                        statusHttp: HTTP_BAD_REQUEST,
                        status: 'ERR',
                        message: 'Đơn nhập hàng đã bị hủy hoặc đã hoàn thành',
                    });
                } else {
                    // Update trạng thái đơn nhập hàng
                    await orderPurchaseFind.update({ status }, { transaction }); // đơn nhập
                    if (orderPurchaseFind.status === 'CANCELED') {
                        // update orderpurchasemissing
                        await OrderPurchaseMissing.update(
                            { status: 'CANCELED' },
                            { where: { orderPurchaseID }, transaction },
                        );

                        const orderPurchaseMissingDetails = await OrderPurchaseMissingDetail.findAll({
                            where: { orderPurchaseMissingID: orderPurchaseID },
                        });

                        // update batch status for order purchase missing detai
                        for (const orderPurchaseMissingDetail of orderPurchaseMissingDetails) {
                            await Batch.update(
                                { status: 'REFUSE_IMPORT' },
                                { where: { batchID: orderPurchaseMissingDetail.batchID }, transaction },
                            );
                        }
                    } else if (orderPurchaseFind.status === 'COMPLETED') {
                        // update orderpurchasemissing
                        await OrderPurchaseMissing.update(
                            { status: 'RESOLVED' },
                            { where: { orderPurchaseID }, transaction },
                        );

                        // update amount batch
                        const orderPurchaseMissingDetails = await OrderPurchaseMissingDetail.findAll({
                            where: { orderPurchaseMissingID: orderPurchaseID },
                        });

                        for (const orderPurchaseMissingDetail of orderPurchaseMissingDetails) {
                            const orderPurchaseDetail = orderPurchaseMissingDetails.find(
                                (item) =>
                                    item.orderPurchaseDetailID === orderPurchaseMissingDetail.orderPurchaseDetailID,
                            );
                            const batchFind = await Batch.findOne({
                                where: { batchID: orderPurchaseDetail.batchID },
                                include: [
                                    { model: Product, as: 'product' },
                                    { model: Unit, as: 'unit' },
                                ],
                            });
                            if (batchFind) {
                                await batchFind.update(
                                    {
                                        importAmount: orderPurchaseDetail.missingQuantity,
                                        remainAmount: orderPurchaseDetail.missingQuantity,
                                        tempAmount: orderPurchaseDetail.missingQuantity,
                                    },
                                    { transaction },
                                );

                                // update amount product
                                const amountConvert =
                                    batchFind.unit.conversionQuantity * orderPurchaseDetail.missingQuantity;

                                await Product.update(
                                    {
                                        amount: batchFind.product.amount + amountConvert,
                                    },
                                    { where: { productID: batchFind.product.productID }, transaction },
                                );
                            }
                        }
                    }
                }

                await transaction.commit();
                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: 'Đơn nhập hàng đã hoàn thành',
                });
            } catch (e) {
                await transaction.rollback();
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new OrderPurchaseService();
