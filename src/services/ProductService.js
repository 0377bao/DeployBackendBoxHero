const dotenv = require('dotenv');
const db = require('../../models');
const { Op, where } = require('sequelize');
const { generateQRURL } = require('../common');
const Product = db.Product;
const Batch = db.Batch;
const Box = db.Box;
const Floor = db.Floor;
const Shelf = db.Shelf;
const Zone = db.Zone;
const Unit = db.Unit;
const Category = db.Category;
const BaseUnitProduct = db.BaseUnitProduct;
dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_DUPLICATE = process.env.HTTP_DUPLICATE;

class ProductService {
    findProductById(productID, warehouseID) {
        return new Promise(async (resolve, reject) => {
            console.log('----', productID);
            console.log('vào', productID);
            try {
                // tìm sản phẩm kèm tất cả các lô của sản phẩm
                const product = await Product.findOne({
                    where: { productID },
                    include: [
                        {
                            model: Batch,
                            as: 'batches',
                        },
                        {
                            model: BaseUnitProduct,
                            as: 'baseUnitProducts',
                            attributes: ['baseUnitProductID', 'baseUnitName'],
                        },
                    ],
                });

                if (!product) {
                    console.log('product not found');
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Sản phẩm không tồn tại',
                    });
                }

                const { batches, ...restProduct } = product.toJSON();
                const filterBatch = batches.filter((item) => item.warehouseID == warehouseID);

                // tìm tất cả vị trí các lô của sản phẩm trong kho
                const listBatch = await Promise.all(
                    filterBatch.map((item) =>
                        Batch.findOne({
                            where: { batchID: item.batchID },
                            include: [
                                {
                                    model: Box,
                                    as: 'boxes',
                                    attributes: ['boxID', 'boxName'],
                                    through: { attributes: [], as: 'Batch_Boxes' },
                                    include: [
                                        {
                                            model: Floor,
                                            attributes: ['floorID', 'floorName'],
                                            include: [
                                                {
                                                    model: Shelf,
                                                    attributes: ['shelfID', 'shelfName'],
                                                    include: [
                                                        {
                                                            model: Zone,
                                                            attributes: ['zoneID', 'zoneName', 'warehouseID'],
                                                            as: 'zone',
                                                        },
                                                    ],
                                                    as: 'shelf',
                                                },
                                            ],
                                            as: 'floor',
                                        },
                                    ],
                                },
                                {
                                    model: Unit,
                                    attributes: ['unitID', 'unitName', 'conversionQuantity'],
                                    as: 'unit',
                                },
                            ],
                        }),
                    ),
                );

                if (listBatch) {
                    const formatBatchResponse = listBatch
                        .map((item) => {
                            const { boxes, ...restBatch } = item.toJSON();
                            const { unit, remainAmount, ...rest } = restBatch;
                            const totalProductRemain =
                                Number.parseInt(unit.conversionQuantity) * Number.parseInt(remainAmount);
                            const locationBatch = boxes.map((boxItem) => {
                                console.log(boxItem);
                                const { boxID, boxName } = boxItem;
                                const { floorName } = boxItem.floor;
                                const { shelfName } = boxItem.floor.shelf;
                                const { zoneName } = boxItem.floor.shelf.zone;
                                return {
                                    boxID,
                                    boxName,
                                    location: `${boxName} - ${floorName} - ${shelfName} - ${zoneName}`,
                                };
                            });
                            return {
                                ...rest,
                                unitName: unit.unitName,
                                remainAmount,
                                totalProductRemain,
                                locationBatch,
                            };
                        })
                        .filter((item) => item.remainAmount > 0);

                    return resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Lấy thông tin sản phẩm thành công',
                        product: {
                            ...restProduct,
                            batches: formatBatchResponse,
                        },
                    });
                    //console.log('3');
                }
                return resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy thông tin sản phẩm thành công',
                    product: {
                        ...restProduct,
                        batches: [],
                    },
                });
                //console.log(4);
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
    findAllProduct(page = 1, rest = {}) {
        return new Promise(async (resolve, reject) => {
            const LIMIT_PAGE = 5;
            try {
                const products = await Product.findAll({
                    where: { ...rest },
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
                    offset: (page - 1) * LIMIT_PAGE,
                    limit: LIMIT_PAGE,
                });
                const total = await Product.count();
                const totalPages = Math.ceil(total / LIMIT_PAGE);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách sản phẩm thành công',
                    products,
                    pagination: {
                        currentPage: page,
                        totalPages,
                    },
                });
            } catch (err) {
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
                console.log(err);
            }
        });
    }
    searchProduct({ productID, productName, categoryID, minStock, supplierID, page = 1 }) {
        return new Promise(async (resolve, reject) => {
            try {
                const LIMIT_PAGE = 5;
                //console.log(minStock)
                let where = {};
                if (productID) where.productID = { [Op.like]: `%${productID}%` };
                if (productName) where.productName = { [Op.like]: `%${productName}%` };
                if (minStock) where.minStock = minStock;
                if (categoryID) where.categoryID = categoryID;
                if (supplierID) where.supplierID = supplierID;

                const resultSearch = await Product.findAll({
                    where,
                    include: [
                        {
                            model: Category,
                            attributes: ['categoryID', 'categoryName'],
                            as: 'category',
                        },
                        {
                            model: BaseUnitProduct,
                            attributes: ['baseUnitProductID', 'baseUnitName'],
                            as: 'baseUnitProducts',
                        },
                    ],
                    offset: (page - 1) * LIMIT_PAGE,
                    limit: LIMIT_PAGE,
                });
                const total = await Product.count({ where });
                const totalPages = Math.ceil(total / LIMIT_PAGE);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tìm kiếm thành công',
                    products: resultSearch,
                    pagination: {
                        currentPage: page,
                        totalPages,
                    },
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
    updateProduct(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                let updateData = {};
                if (data.productName) updateData.productName = data.productName;
                if (data.minStock) updateData.minStock = data.minStock;
                if (data.status) updateData.status = data.status;
                const updateResult = await Product.update(
                    updateData,
                    {
                        where: { productID: data.productID },
                    },
                    {
                        transaction,
                    },
                );
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Cập nhật sản phẩm thành công',
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
    filterProduct(data) {
        return new Promise(async (resolve, reject) => {
            const condition = {};
            const page = data?.page || 1;
            const limit = 5;
            if (data?.status) condition.status = data.status;
            if (data?.minAmount) condition.amount = { [Op.gt]: data.minAmount };
            try {
                const products = await Product.findAll({
                    where: condition,
                    include: [
                        {
                            model: BaseUnitProduct,
                            as: 'baseUnitProducts',
                            attributes: ['baseUnitName'],
                        },
                    ],
                    limit,
                    offset: (page - 1) * limit,
                });
                const total = await Product.count({ where: condition });
                const totalPages = Math.ceil(total / limit);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách sản phẩm thành công',
                    data: products,
                    pagination: {
                        currentPage: page,
                        totalPages,
                    },
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
    async createProduct(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const existProduct = await Product.findOne({
                    where: { productID: data.productID },
                });
                if (existProduct) {
                    return resolve({
                        status: 'ERR',
                        statusHttp: HTTP_DUPLICATE,
                        message: 'Sản phẩm đã tồn tại',
                    });
                }
                const qrCode = await generateQRURL(data.productID);
                const newProduct = await Product.create(
                    {
                        productID: data.productID,
                        productName: data.productName,
                        categoryID: data.categoryID,
                        minStock: data.minStock,
                        status: data.status,
                        baseUnitProductID: data.baseUnitProductID,
                        amount: 0,
                        qrCode,
                        price: data?.price || 25000,
                        image: data?.image || '',
                        description: data?.description || '',
                    },
                    { transaction },
                );
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tạo sản phẩm thành công',
                    data: newProduct,
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
    async getProductCanExport(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const productExist = await Product.findOne({
                    where: { productID: data },
                    include: [{ model: BaseUnitProduct, as: 'baseUnitProducts', attributes: ['baseUnitName'] }],
                });

                if (!productExist)
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: `Sản phẩm có mã ${data} không tồn tại`,
                    });

                const productCanExport = await Product.findOne({
                    where: {
                        productID: data,
                        amount: { [Op.gt]: 0 },
                    },
                });

                // check có lô hàng trong kho
                // const checkProductBatch = await Batch.findAll({
                //     where: { productID: data },
                //     include: [
                //         {
                //             model: Box,
                //             as: 'boxes',
                //             attributes: ['boxID', 'boxName'],
                //             through: {
                //                 attributes: ['quantity'],
                //                 where: { quantity: { [Op.gt]: 0 } },
                //             },
                //         },
                //     ],
                // });

                // const isValidCheckProductBatch = JSON.parse(JSON.stringify(checkProductBatch)).some(
                //     (it) => it.boxes.length > 0,
                // );

                // if (!isValidCheckProductBatch)
                //     reject({
                //         status: 'ERR',
                //         statusHttp: HTTP_NOT_FOUND,
                //         message: 'Sản phẩm không có sẵn hàng trong kho để xuất',
                //     });
                if (!productCanExport) {
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Sản phẩm không có sẵn hàng trong kho để xuất',
                    });
                }

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    product: productExist,
                    message: 'Tìm kiếm sản phẩm thành công',
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

    generateQRForProducts() {
        return new Promise(async (resolve, reject) => {
            try {
                const products = await Product.findAll();
                const updates = products.map(async (product) => {
                    const qrCode = await generateQRURL(product.productID);
                    product.qrCode = qrCode;
                    return product.save();
                });

                await Promise.all(updates);

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Generated QR codes for all products successfully',
                    data: products,
                });
            } catch (e) {
                console.log(e);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Error generating QR codes for products',
                    error: e,
                });
            }
        });
    }
}

module.exports = new ProductService();
