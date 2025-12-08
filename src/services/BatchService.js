const db = require('../../models');
const Batch = db.Batch;
const Unit = db.Unit;
const Warehouse = db.Warehouse;
const Product = db.Product;
const BatchBox = db.BatchBox;
const Box = db.Box;
const Floor = db.Floor;
const Shelf = db.Shelf;
const Zone = db.Zone;
const dotenv = require('dotenv');
const { Op } = require('sequelize');
const { generateQRURL } = require('../common');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class BatchService {
    findAllBatchUnit(warehouseID, productID) {
        return new Promise(async (resolve, reject) => {
            try {
                const warehouseExist = await Warehouse.findOne({
                    where: { warehouseID },
                });

                if (!warehouseExist)
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Kho không tồn tại',
                    });

                const productExist = await Product.findOne({
                    where: { productID },
                });
                if (!productExist)
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Sản phẩm không tồn tại',
                    });

                const listUnit = await Batch.findAll({
                    where: { productID, warehouseID },
                    include: [
                        {
                            model: Unit,
                            as: 'unit',
                            attributes: ['unitID', 'unitName'],
                        },
                    ],
                });

                const formatListUnit = listUnit.map((item) => {
                    const { unit, ...rest } = item.toJSON();
                    return unit;
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách đơn vị tính theo lô của sản phẩm thành công',
                    units: formatListUnit,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getBatchesWithoutLocation(warehouseID, page = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                const limit = 5;
                const offset = (page - 1) * limit;

                // Kiểm tra warehouse có tồn tại không
                if (warehouseID) {
                    const warehouseExist = await Warehouse.findOne({
                        where: { warehouseID },
                    });

                    if (!warehouseExist) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: 'Kho không tồn tại',
                        });
                    }
                }

                // Lấy danh sách các batch chưa có location (chưa có batch_box)
                const whereCondition = warehouseID ? { warehouseID } : {};

                const { count, rows: batchesWithoutLocation } = await Batch.findAndCountAll({
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['productID', 'productName'],
                        },
                        {
                            model: Unit,
                            as: 'unit',
                        },
                        {
                            model: Warehouse,
                            as: 'warehouse',
                            attributes: ['warehouseID', 'warehouseName'],
                        },
                    ],
                    where: {
                        ...whereCondition,
                        status: 'AVAILABLE',
                        batchID: {
                            [db.Sequelize.Op.notIn]: db.sequelize.literal(
                                '(SELECT DISTINCT batchID FROM batch_boxes WHERE batchID IS NOT NULL)',
                            ),
                        },
                    },
                    limit: limit,
                    offset: offset,
                    order: [['createdAt', 'ASC']],
                });

                const totalPages = Math.ceil(count / limit);

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách các batch chưa có location thành công',
                    data: batchesWithoutLocation,
                    totalPages,
                    currentPage: parseInt(page),
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    countBatchesWithoutLocation() {
        return new Promise(async (resolve, reject) => {
            try {
                const count = await Batch.count({
                    where: {
                        status: 'AVAILABLE',
                        batchID: {
                            [db.Sequelize.Op.notIn]: db.sequelize.literal(
                                '(SELECT DISTINCT batchID FROM batch_boxes WHERE batchID IS NOT NULL)',
                            ),
                        },
                    },
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Đếm số lượng các batch chưa có location thành công',
                    data: { count },
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getAvailableBoxes(warehouseID) {
        return new Promise(async (resolve, reject) => {
            try {
                // Kiểm tra warehouse có tồn tại không (nếu có truyền warehouseID)
                if (warehouseID) {
                    const warehouseExist = await Warehouse.findOne({
                        where: { warehouseID },
                    });

                    if (!warehouseExist) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: 'Kho không tồn tại',
                        });
                    }
                }
                let whereCondition = {
                    status: {
                        [db.Sequelize.Op.ne]: 'FULL', // Lấy box có status khác FULL
                    },
                };
                let includeCondition = [
                    {
                        model: Floor,
                        as: 'floor',
                        attributes: ['floorID', 'floorName'],
                        include: [
                            {
                                model: Shelf,
                                as: 'shelf',
                                attributes: ['shelfID', 'shelfName'],
                                include: [
                                    {
                                        model: Zone,
                                        as: 'zone',
                                        attributes: ['zoneID', 'zoneName', 'warehouseID'],
                                        ...(warehouseID && {
                                            where: { warehouseID },
                                        }),
                                    },
                                ],
                            },
                        ],
                    },
                ];

                const availableBoxes = await Box.findAll({
                    where: whereCondition,
                    include: includeCondition,
                    order: [
                        ['remainingAcreage', 'DESC'], // Sắp xếp theo diện tích còn lại giảm dần
                        ['boxName', 'ASC'],
                    ],
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách các box còn chỗ chứa thành công',
                    data: availableBoxes,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getBoxesContainingProduct(productID, warehouseID) {
        return new Promise(async (resolve, reject) => {
            try {
                // Kiểm tra warehouse có tồn tại không
                const warehouseExist = await Warehouse.findOne({
                    where: { warehouseID },
                });

                if (!warehouseExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Kho không tồn tại',
                    });
                }

                // Kiểm tra product có tồn tại không
                const productExist = await Product.findOne({
                    where: { productID },
                });

                if (!productExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Sản phẩm không tồn tại',
                    });
                }

                // Lấy danh sách box có chứa sản phẩm cụ thể
                const boxesWithProduct = await Box.findAll({
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            attributes: ['floorID', 'floorName'],
                            include: [
                                {
                                    model: Shelf,
                                    as: 'shelf',
                                    attributes: ['shelfID', 'shelfName'],
                                    include: [
                                        {
                                            model: Zone,
                                            as: 'zone',
                                            attributes: ['zoneID', 'zoneName', 'warehouseID'],
                                            where: { warehouseID },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Batch,
                            as: 'batches',
                            attributes: ['batchID', 'manufactureDate', 'expiryDate', 'remainAmount'],
                            where: {
                                productID,
                                warehouseID,
                            },
                            through: {
                                model: BatchBox,
                                attributes: ['quantity'],
                                where: { quantity: { [db.Sequelize.Op.gt]: 0 } },
                            },
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
                                    attributes: ['productID', 'productName'],
                                },
                                {
                                    model: Unit,
                                    as: 'unit',
                                    attributes: ['unitID', 'unitName'],
                                },
                            ],
                        },
                    ],
                    order: [
                        // Sắp xếp box theo số trong tên box (ví dụ: "Ô 10" -> lấy số 10)
                        [db.sequelize.literal('CAST(SUBSTRING(boxName, 3) AS UNSIGNED)'), 'ASC'],
                    ],
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách các box có chứa sản phẩm thành công',
                    data: boxesWithProduct,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getBoxesContainingBatch(batchID, warehouseID) {
        return new Promise(async (resolve, reject) => {
            try {
                // Kiểm tra warehouse có tồn tại không
                const warehouseExist = await Warehouse.findOne({
                    where: { warehouseID },
                });

                if (!warehouseExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Kho không tồn tại',
                    });
                }

                // Kiểm tra batch có tồn tại không
                const batchExist = await Batch.findOne({
                    where: { batchID },
                });

                if (!batchExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Lô hàng không tồn tại',
                    });
                }

                // Lấy danh sách box có chứa lô hàng cụ thể
                const boxesWithBatch = await Box.findAll({
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            attributes: ['floorID', 'floorName'],
                            include: [
                                {
                                    model: Shelf,
                                    as: 'shelf',
                                    attributes: ['shelfID', 'shelfName'],
                                    include: [
                                        {
                                            model: Zone,
                                            as: 'zone',
                                            attributes: ['zoneID', 'zoneName', 'warehouseID'],
                                            where: { warehouseID },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Batch,
                            as: 'batches',
                            attributes: ['batchID', 'manufactureDate', 'expiryDate', 'remainAmount'],
                            where: {
                                batchID,
                                warehouseID,
                            },
                            through: {
                                model: BatchBox,
                                attributes: ['quantity'],
                                where: { quantity: { [db.Sequelize.Op.gt]: 0 } },
                            },
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
                                    attributes: ['productID', 'productName'],
                                },
                                {
                                    model: Unit,
                                    as: 'unit',
                                    attributes: ['unitID', 'unitName'],
                                },
                            ],
                        },
                    ],
                    order: [
                        // Sắp xếp box theo số trong tên box (ví dụ: "Ô 10" -> lấy số 10)
                        [db.sequelize.literal('CAST(SUBSTRING(boxName, 3) AS UNSIGNED)'), 'ASC'],
                    ],
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách các box có chứa lô hàng thành công',
                    data: boxesWithBatch,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getBoxDetails(boxID) {
        return new Promise(async (resolve, reject) => {
            try {
                // Lấy thông tin chi tiết của box bao gồm batch và product
                const boxDetails = await Box.findOne({
                    where: { boxID },
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            attributes: ['floorID', 'floorName'],
                            include: [
                                {
                                    model: Shelf,
                                    as: 'shelf',
                                    attributes: ['shelfID', 'shelfName'],
                                    include: [
                                        {
                                            model: Zone,
                                            as: 'zone',
                                            attributes: ['zoneID', 'zoneName', 'warehouseID'],
                                            include: [
                                                {
                                                    model: Warehouse,
                                                    as: 'warehouse',
                                                    attributes: ['warehouseID', 'warehouseName'],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Batch,
                            as: 'batches',
                            attributes: [
                                'batchID',
                                'manufactureDate',
                                'expiryDate',
                                'importAmount',
                                'remainAmount',
                                'status',
                            ],
                            through: {
                                model: BatchBox,
                                attributes: ['quantity', 'validQuantity', 'pendingOutQuantity'],
                            },
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
                                    attributes: ['productID', 'productName', 'description'],
                                    include: [
                                        {
                                            model: db.Category,
                                            as: 'category',
                                            attributes: ['categoryID', 'categoryName'],
                                        },
                                    ],
                                },
                                {
                                    model: Unit,
                                    as: 'unit',
                                },
                                {
                                    model: db.Supplier,
                                    as: 'supplier',
                                    attributes: ['supplierID', 'supplierName', 'phoneNumber', 'email'],
                                },
                            ],
                        },
                    ],
                });

                if (!boxDetails) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Box không tồn tại',
                    });
                }

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy thông tin box thành công',
                    data: boxDetails,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
    async getAllBatchByProductID(productID, warehouseID, unitID) {
        return new Promise(async (resolve, reject) => {
            try {
                const productExist = await Product.findOne({
                    where: { productID },
                });
                if (!productExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Sản phẩm không tồn tại',
                    });
                }
                const batches = await Batch.findAll({
                    where: { productID, warehouseID, validAmount: { [Op.gt]: 0 }, unitID },

                    include: [
                        { model: Unit, as: 'unit', attributes: ['unitID', 'unitName'] },
                        {
                            model: Box,
                            as: 'boxes',
                            attributes: ['boxID', 'boxName'],
                            through: {
                                attributes: ['quantity', 'validQuantity', 'pendingOutQuantity'],
                                where: { validQuantity: { [Op.gt]: 0 } },
                            },
                            required: true,
                        },
                    ],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: batches,
                });
            } catch (error) {
                console.error(error);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Không thể lấy danh sách lô hàng: ' + error.message,
                });
            }
        });
    }
    async suggestBatchBForExport(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { productID, type, warehouseID } = data;
                const batchValid = await this.getAllBatchByProductID(productID, warehouseID);

                switch (type) {
                    case 'expirePriority': {
                        const parseArray = JSON.parse(JSON.stringify(batchValid.data));
                        const sortBatchValid = parseArray.sort((a, b) => a.expireDate - b.expireDate);

                        resolve({
                            status: 'OK',
                            statusHttp: HTTP_OK,
                            data: sortBatchValid,
                        });
                        break;
                    }
                    case 'positionPriority': {
                        // xây map ưu tiên cho kệ
                        const shelfMapPriority = new Map();
                        let maxPriority = 10;
                        const shelfList = await Shelf.findAll();

                        JSON.parse(JSON.stringify(shelfList)).forEach((sh) => {
                            shelfMapPriority.set(sh.shelfID, maxPriority);
                            maxPriority--;
                        });

                        resolve({
                            status: 'OK',
                            statusHttp: HTTP_OK,
                            data: [],
                        });
                        break;
                    }
                    case 'rankPriority': {
                        const sortedByImportDate = batchValid.data.sort(
                            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                        );

                        resolve({
                            status: 'OK',
                            statusHttp: HTTP_OK,
                            data: sortedByImportDate,
                        });
                        break;
                    }
                    default: {
                        resolve({
                            status: 'OK',
                            statusHttp: HTTP_OK,
                            data: [...(batchValid.data || [])],
                        });
                    }
                }
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

    generateQRForBatches() {
        return new Promise(async (resolve, reject) => {
            try {
                const batches = await Batch.findAll();
                const updates = batches.map(async (batch) => {
                    const qrCode = await generateQRURL(batch.batchID);
                    batch.qrCode = qrCode;
                    return batch.save();
                });

                await Promise.all(updates);

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Generated QR codes for all batches successfully',
                    data: batches,
                });
            } catch (e) {
                console.log(e);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Error generating QR codes for batches',
                    error: e,
                });
            }
        });
    }
}

module.exports = new BatchService();
