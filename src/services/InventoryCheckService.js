const { Op, where, fn, col, Sequelize } = require('sequelize');
const db = require('../../models');
const InventoryCheck = db.InventoryCheck;
const InventoryCheckDetail = db.InventoryCheckDetail;
const Product = db.Product;
const Employee = db.Employee;
const BatchBox = db.BatchBox;
const ProductQuantityLog = db.ProductQuantityLog;
const Batch = db.Batch;
const Box = db.Box;
const Unit = db.Unit;
const Floor = db.Floor;
const Shelf = db.Shelf;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const { generateQRURL } = require('../common');

class InventoryCheckService {
    findAll({ warehouseID, page = 1 }) {
        return new Promise(async (resolve, reject) => {
            const LIMIT_PAGE = 5;
            try {
                const response = await InventoryCheck.findAll({
                    where: { warehouseID },
                    include: [
                        { model: Employee, as: 'employee' },
                        {
                            model: InventoryCheckDetail,
                            as: 'details',
                            include: [
                                {
                                    model: BatchBox,
                                    as: 'batchBoxByBatch',
                                    required: false,
                                    on: {
                                        [Op.and]: [
                                            db.sequelize.where(
                                                db.sequelize.col('details.batchID'),
                                                '=',
                                                db.sequelize.col('details->batchBoxByBatch.batchID'),
                                            ),
                                            db.sequelize.where(
                                                db.sequelize.col('details.boxID'),
                                                '=',
                                                db.sequelize.col('details->batchBoxByBatch.boxID'),
                                            ),
                                        ],
                                    },
                                    attribute: ['quantity'],
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                { model: Product, as: 'product' },
                                                { model: Unit, as: 'unit' },
                                            ],
                                        },
                                        {
                                            model: Box,
                                            as: 'box',
                                            include: [
                                                { model: Floor, as: 'floor', include: [{ model: Shelf, as: 'shelf' }] },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                    offset: (page - 1) * LIMIT_PAGE,
                    limit: LIMIT_PAGE,
                });

                const total = await InventoryCheck.count({ where: { warehouseID } });

                const totalPages = Math.ceil(total / LIMIT_PAGE);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách kiểm kê thành công',
                    data: response,
                    pagination: {
                        totalPages,
                        currentPage: page,
                    },
                });
            } catch (err) {
                console.log(err);

                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
    filterInventoryCheck({ warehouseID, inventoryCheckID, status, checkStatus, createdAt, employeeName, page = 1 }) {
        return new Promise(async (resolve, reject) => {
            const queryEmployee = {};
            const filterOptions = {};
            if (status) {
                filterOptions.status = status;
            }
            if (checkStatus) {
                filterOptions.checkStatus = checkStatus;
            }
            if (inventoryCheckID) {
                filterOptions.inventoryCheckID = inventoryCheckID;
            }
            if (employeeName) {
                queryEmployee.employeeName = { [Op.like]: `%${employeeName}%` };
            }
            const date = {};
            if (createdAt)
                date.createdAt = {
                    [Op.and]: [
                        where(fn('DATE', col('InventoryCheck.createdAt')), {
                            [Op.eq]: createdAt, // ngày bắt đầu
                        }),
                    ],
                };
            const LIMIT_PAGE = 5;
            try {
                const response = await InventoryCheck.findAll({
                    where: {
                        warehouseID,
                        ...date,
                        ...filterOptions,
                    },
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                            where: queryEmployee,
                        },
                        {
                            model: InventoryCheckDetail,
                            as: 'details',
                            include: [
                                {
                                    model: BatchBox,
                                    as: 'batchBoxByBatch',
                                    required: false,
                                    on: {
                                        [Op.and]: [
                                            db.sequelize.where(
                                                db.sequelize.col('details.batchID'),
                                                '=',
                                                db.sequelize.col('details->batchBoxByBatch.batchID'),
                                            ),
                                            db.sequelize.where(
                                                db.sequelize.col('details.boxID'),
                                                '=',
                                                db.sequelize.col('details->batchBoxByBatch.boxID'),
                                            ),
                                        ],
                                    },
                                    attribute: ['quantity'],
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                { model: Product, as: 'product' },
                                                { model: Unit, as: 'unit' },
                                            ],
                                        },
                                        {
                                            model: Box,
                                            as: 'box',
                                            include: [
                                                { model: Floor, as: 'floor', include: [{ model: Shelf, as: 'shelf' }] },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                    offset: (page - 1) * LIMIT_PAGE,
                    limit: LIMIT_PAGE,
                });
                const total = await InventoryCheck.count({
                    where: {
                        warehouseID,
                        ...date,
                        ...filterOptions,
                    },
                });
                const totalPages = Math.ceil(total / LIMIT_PAGE);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách kiểm kê thành công',
                    data: response,
                    pagination: {
                        currentPage: page,
                        totalPages,
                    },
                });
            } catch (err) {
                console.log(err);

                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }

    createInventoryCheck(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { inventoryCheckID, employeeID, warehouseID, details } = data;
                const qrCode = await generateQRURL(inventoryCheckID);
                const newInventoryCheck = await InventoryCheck.create(
                    {
                        inventoryCheckID,
                        employeeID,
                        warehouseID,
                        status: 'PENDING_CHECK',
                        checkStatus: null,
                        qrCode,
                    },
                    { transaction },
                );

                const inventoryDetailConvert = details.map((item) => {
                    return { ...item, status: null, discrepancyQuantity: null, actualQuantity: null };
                });

                const inventoryCheckDetails = inventoryDetailConvert.map((detail) => ({
                    ...detail,
                    inventoryCheckID: newInventoryCheck.inventoryCheckID,
                }));
                await InventoryCheckDetail.bulkCreate(inventoryCheckDetails, { transaction });

                const createdInventoryCheck = await InventoryCheck.findOne({
                    where: { inventoryCheckID: newInventoryCheck.inventoryCheckID },
                    include: [
                        { model: Employee, as: 'employee' },
                        {
                            model: InventoryCheckDetail,
                            as: 'details',
                            include: [
                                {
                                    model: BatchBox,
                                    as: 'batchBoxByBatch',
                                    attribute: ['quantity'],
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                { model: Product, as: 'product' },
                                                { model: Unit, as: 'unit' },
                                            ],
                                        },
                                        {
                                            model: Box,
                                            as: 'box',
                                            include: [{ model: Floor, as: 'floor' }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                });
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tạo phiếu kiểm kê thành công',
                    data: createdInventoryCheck,
                });
            } catch (err) {
                await transaction.rollback();
                console.log(err);

                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }

    submitInventoryCheck(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { inventoryCheckID, details } = data;

                const inventoryCheck = await InventoryCheck.findOne({
                    where: { inventoryCheckID },
                    transaction,
                });

                if (!inventoryCheck) {
                    await transaction.rollback();
                    return reject({
                        status: 'ERROR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Phiếu kiểm kê không tồn tại',
                    });
                }

                if (inventoryCheck.status !== 'PENDING_CHECK') {
                    await transaction.rollback();
                    return reject({
                        status: 'ERROR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Phiếu kiểm kê không ở trạng thái đang kiểm kê',
                    });
                }

                let isDiscrepancy = false;

                for (const item of details) {
                    const { inventoryCheckDetailID, actualQuantity } = item;

                    const detail = await InventoryCheckDetail.findOne({
                        where: { inventoryCheckDetailID, inventoryCheckID },
                        transaction,
                    });

                    if (!detail) continue;

                    const discrepancyQuantity = actualQuantity - detail.systemQuantity;
                    let status = 'MATCHED';
                    if (discrepancyQuantity > 0) {
                        status = 'SURPLUS';
                        isDiscrepancy = true;
                    } else if (discrepancyQuantity < 0) {
                        status = 'SHORTAGE';
                        isDiscrepancy = true;
                    }

                    await InventoryCheckDetail.update(
                        {
                            actualQuantity,
                            discrepancyQuantity,
                            status,
                        },
                        {
                            where: { inventoryCheckDetailID },
                            transaction,
                        },
                    );
                }

                await InventoryCheck.update(
                    {
                        status: 'PENDING',
                        checkStatus: isDiscrepancy ? 'DISCREPANCY' : 'BALANCED',
                    },
                    {
                        where: { inventoryCheckID },
                        transaction,
                    },
                );

                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Hoàn thành kiểm kê, chờ duyệt',
                });
            } catch (err) {
                await transaction.rollback();
                console.log(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }

    updateInventoryCheck(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { inventoryCheckID, status } = data;
                await InventoryCheck.update({ status }, { where: { inventoryCheckID }, transaction });

                if (status === 'COMPLETED') {
                    const details = await InventoryCheckDetail.findAll({
                        where: { inventoryCheckID },
                        include: [
                            {
                                model: BatchBox,
                                as: 'batchBoxByBatch',
                                required: false,
                                on: {
                                    [Op.and]: [
                                        db.sequelize.where(
                                            db.sequelize.col('InventoryCheckDetail.batchID'),
                                            '=',
                                            db.sequelize.col('batchBoxByBatch.batchID'),
                                        ),
                                        db.sequelize.where(
                                            db.sequelize.col('InventoryCheckDetail.boxID'),
                                            '=',
                                            db.sequelize.col('batchBoxByBatch.boxID'),
                                        ),
                                    ],
                                },
                                attributes: ['quantity', 'validQuantity', 'pendingOutQuantity'],
                                include: [
                                    {
                                        model: Batch,
                                        as: 'batch',
                                        include: [
                                            { model: Product, as: 'product' },
                                            { model: Unit, as: 'unit' },
                                        ],
                                    },
                                    {
                                        model: Box,
                                        as: 'box',
                                        include: [{ model: Floor, as: 'floor' }],
                                    },
                                ],
                            },
                        ],
                        transaction,
                    });

                    for (const detail of details) {
                        const discrepancyQuantity = detail.discrepancyQuantity;
                        const batchBox = detail.batchBoxByBatch;

                        if (!batchBox) continue;

                        if (discrepancyQuantity !== 0) {
                            let quantityChange = discrepancyQuantity;
                            let validQuantityChange = 0;
                            let pendingOutQuantityChange = 0;

                            if (discrepancyQuantity > 0) {
                                // Surplus: Increase validQuantity
                                validQuantityChange = discrepancyQuantity;
                            } else {
                                // Shortage: Decrease validQuantity first, then pendingOutQuantity
                                const shortage = Math.abs(discrepancyQuantity);
                                const currentValid = batchBox.validQuantity;

                                if (currentValid >= shortage) {
                                    validQuantityChange = -shortage;
                                } else {
                                    validQuantityChange = -currentValid;
                                    pendingOutQuantityChange = -(shortage - currentValid);
                                }
                            }

                            // Update BatchBox
                            await BatchBox.increment(
                                {
                                    quantity: quantityChange,
                                    validQuantity: validQuantityChange,
                                    pendingOutQuantity: pendingOutQuantityChange,
                                },
                                { where: { batchID: batchBox.batch.batchID, boxID: batchBox.box.boxID }, transaction },
                            );

                            // Update Batch
                            await Batch.increment(
                                {
                                    remainAmount: quantityChange,
                                    validAmount: validQuantityChange,
                                    pendingOutAmount: pendingOutQuantityChange,
                                },
                                { where: { batchID: batchBox.batch.batchID }, transaction },
                            );

                            // Update Product
                            const amountChange = discrepancyQuantity * batchBox.batch.unit.conversionQuantity;
                            await Product.increment(
                                { amount: amountChange },
                                { where: { productID: batchBox.batch.product.productID }, transaction },
                            );

                            // Update Box Acreage
                            const acreage =
                                batchBox.batch.unit.width *
                                batchBox.batch.unit.length *
                                batchBox.batch.unit.height *
                                -discrepancyQuantity;

                            await Box.increment(
                                { remainingAcreage: acreage },
                                { where: { boxID: batchBox.box.boxID }, transaction },
                            );

                            // Update Box Status
                            const updatedBox = await Box.findOne({
                                where: { boxID: batchBox.box.boxID },
                                transaction,
                            });

                            if (updatedBox.remainingAcreage >= updatedBox.maxAcreage) {
                                await Box.update(
                                    { status: 'AVAILABLE' },
                                    { where: { boxID: batchBox.box.boxID }, transaction },
                                );
                            } else if (updatedBox.remainingAcreage <= 0) {
                                await Box.update(
                                    { status: 'FULL' },
                                    { where: { boxID: batchBox.box.boxID }, transaction },
                                );
                            } else {
                                await Box.update(
                                    { status: 'OCCUPIED' },
                                    { where: { boxID: batchBox.box.boxID }, transaction },
                                );
                            }

                            // Create ProductQuantityLog
                            await ProductQuantityLog.create(
                                {
                                    actionType: 'INVENTORY_CHECK',
                                    quantityChange: amountChange,
                                    previousAmount: batchBox.batch.product.amount,
                                    newAmount: batchBox.batch.product.amount + amountChange,
                                    referenceID: inventoryCheckID,
                                    note: `Điều chỉnh số lượng từ đơn kiểm kê ${inventoryCheckID}`,
                                    productID: batchBox.batch.product.productID,
                                },
                                { transaction },
                            );
                        }
                    }
                }

                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Cập nhật phiếu kiểm kê thành công',
                });
            } catch (err) {
                await transaction.rollback();
                console.log(err);

                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
}

module.exports = new InventoryCheckService();
