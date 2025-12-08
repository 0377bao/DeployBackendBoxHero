const db = require('../../models');
const { Op, where } = require('sequelize');
const Warehouse = db.Warehouse;
const Batch = db.Batch;
const Product = db.Product;
const Box = db.Box;
const Floor = db.Floor;
const Shelf = db.Shelf;
const Zone = db.Zone;
const Unit = db.Unit;
const BatchBox = db.BatchBox;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class BatchBoxService {
    async suggestBoxes(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    warehouseID,
                    batchIDs,
                    locationScore = 0,
                    expiredScore = 0,
                    unitScore = 0,
                    productSimilarityScore = 0,
                    enoughAcreageScore = 0,
                } = data;

                // 2. Lấy danh sách batch trong kho
                let batches = [];
                for (const id of batchIDs) {
                    const batch = await Batch.findOne({
                        where: { batchID: id },
                        include: [
                            { model: Unit, as: 'unit' },
                            { model: Product, as: 'product' },
                            { model: Box, as: 'boxes', attributes: ['boxID'], through: { attributes: [] } },
                        ],
                    });

                    if (!batch) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: `Batch ${id} không tồn tại`,
                        });
                    }

                    if (batch.warehouseID !== warehouseID) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Batch ${id} không thuộc kho ${warehouseID}`,
                        });
                    }

                    if (batch.status !== 'AVAILABLE') {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Batch ${id} không khả dụng (status = ${batch.status})`,
                        });
                    }

                    if (batch.remainAmount <= 0) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Batch ${id} đã hết hàng (remainAmount = 0)`,
                        });
                    }

                    if (batch.boxes && batch.boxes.length > 0) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Batch ${id} đã có nơi lưu trữ (boxID = ${batch.boxes
                                .map((b) => b.boxID)
                                .join(', ')})`,
                        });
                    }

                    // Nếu ok thì add vào mảng hợp lệ
                    batches.push(batch);
                }

                // 3. Lấy danh sách box khả dụng
                let candidateBoxes = await Box.findAll({
                    where: {
                        status: { [Op.in]: ['AVAILABLE', 'RESERVED', 'OCCUPIED'] },
                        remainingAcreage: { [Op.gt]: 0 },
                    },
                    order: [[db.sequelize.literal('CAST(SUBSTRING(boxName, 3) AS UNSIGNED)'), 'ASC']],
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            include: [
                                {
                                    model: Shelf,
                                    as: 'shelf',
                                    include: [
                                        {
                                            model: Zone,
                                            as: 'zone',
                                            where: { warehouseID },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Batch,
                            as: 'batches',
                            attributes: ['batchID', 'productID', 'unitID'],
                            through: {
                                model: BatchBox,
                                attributes: ['quantity'],
                                where: { quantity: { [Op.gt]: 0 } },
                            },
                        },
                    ],
                });

                if (!candidateBoxes.length) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Không tìm thấy box nào khả dụng',
                    });
                }

                // 4. Hàm tính điểm expiry
                const expiryScore = (batch) => {
                    const now = new Date();
                    const daysToExpiry = Math.max(0, Math.ceil((batch.expiryDate - now) / (1000 * 60 * 60 * 24)));
                    const base = Math.min(20, 20 * (1 / (1 + daysToExpiry / 30)));
                    return base * expiredScore;
                };

                const enoughAcreageScoreFunction = (batch, box, enoughAcreageWeight) => {
                    const unitVolume = batch.unit.length * batch.unit.width * batch.unit.height;
                    const requiredVolume = unitVolume * batch.remainAmount;
                    if (box.remainingAcreage < requiredVolume) return 0;

                    const ratio = requiredVolume / box.remainingAcreage;
                    const base = 20 * Math.min(1, ratio);
                    return base * enoughAcreageWeight;
                };

                const productScoreFunction = (batch, box, productWeight) => {
                    const sameProduct = box.batches.some((b) => b.productID === batch.productID);
                    return (sameProduct ? 20 : 0) * productWeight;
                };

                const unitScoreFunction = (batch, box, unitWeight) => {
                    const sameUnit = box.batches.some((b) => b.unitID === batch.unitID);
                    return (sameUnit ? 20 : 0) * unitWeight;
                };

                const locationScoreFunction = (shelf) => {
                    const shelfNum = parseInt(shelf?.shelfName?.replace(/\D/g, '')) || 99;

                    const floorNum = parseInt(shelf?.floor?.floorName?.replace(/\D/g, '')) || 1;

                    // --- Cấu hình ---
                    const totalShelves = 10;
                    const baseShelfScore = 20;
                    const shelfPenalty = 2;
                    const floorBonus = 0.5;

                    // --- Tính điểm theo kệ ---
                    let score = 0;
                    if (shelfNum >= 1 && shelfNum <= totalShelves) {
                        const shelfBonus = Math.max(0, baseShelfScore - (shelfNum - 1) * shelfPenalty);
                        score = shelfBonus * locationScore;
                    }
                    if (floorNum == 1) {
                        score += floorBonus * locationScore;
                    }

                    return score;
                };

                // 5. Hàm tính điểm box
                const boxScore = (batch, box) => {
                    let score = 0;

                    if (enoughAcreageScore > 0) {
                        score += enoughAcreageScoreFunction(batch, box, enoughAcreageScore);
                    }
                    if (productSimilarityScore > 0) {
                        const productScore = productScoreFunction(batch, box, productSimilarityScore);
                        if (productScore > 0) {
                            score += productScore;
                        } else if (locationScore === 0 && unitScore === 0 && enoughAcreageScore === 0) {
                            score += enoughAcreageScoreFunction(batch, box, 1);
                        }
                    }
                    if (unitScore > 0) {
                        score += unitScoreFunction(batch, box, unitScore);
                    }
                    if (locationScore > 0) {
                        score += locationScoreFunction(box, box.floor.shelf, locationScore);
                    }

                    return score;
                };

                // 6. Phân bổ batch vào box theo global best match
                let suggestions = [];
                let remainingBatches = [...batches];
                let availableBoxes = [...candidateBoxes];

                while (remainingBatches.length > 0 && availableBoxes.length > 0) {
                    // Tạo toàn bộ batch-box pairs
                    let scoredPairs = [];
                    for (let batch of remainingBatches) {
                        for (let box of availableBoxes) {
                            const unit = batch.unit;
                            const unitVolume = unit.length * unit.width * unit.height;
                            if (box.remainingAcreage < unitVolume) {
                                scoredPairs.push({ batch, box, score: 0 });
                            } else {
                                const score = expiryScore(batch) + boxScore(batch, box);
                                scoredPairs.push({ batch, box, score });
                            }
                        }
                    }

                    if (scoredPairs.length === 0) break;

                    // Chọn pair có score cao nhất
                    scoredPairs.sort((a, b) => b.score - a.score);
                    const { batch, box } = scoredPairs[0];

                    const unit = batch.unit;
                    const unitVolume = unit.length * unit.width * unit.height;

                    const maxCapacity = Math.floor(box.remainingAcreage / unitVolume);
                    const isBatchLarger = batch.remainAmount > maxCapacity;
                    let placed;
                    const remainingBoxesBefore = box.remainingAcreage;

                    if (isBatchLarger) {
                        placed = maxCapacity;
                        availableBoxes = availableBoxes.filter((b) => b.boxID !== box.boxID);
                        batch.remainAmount -= placed;
                    } else {
                        placed = batch.remainAmount;
                        remainingBatches = remainingBatches.filter((b) => b.batchID !== batch.batchID);
                        box.remainingAcreage -= placed * unitVolume;
                    }

                    const { batches: batchInfo, ...boxInfo } = box.get({ plain: true });
                    // Ghi kết quả, group theo batchID
                    let suggestion = suggestions.find((s) => s.batchID === batch.batchID);
                    if (!suggestion) {
                        suggestion = {
                            batchID: batch.batchID,
                            locations: [],
                        };
                        suggestions.push(suggestion);
                    }
                    suggestion.locations.push({
                        ...boxInfo,
                        remainingAcreage: remainingBoxesBefore,
                        quantity: placed,
                    });
                }

                // Nếu hết box mà vẫn còn batch => lỗi
                if (remainingBatches.length > 0 && availableBoxes.length === 0) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Không đủ chỗ để chứa toàn bộ batch',
                    });
                }

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Gợi ý vị trí box thành công',
                    data: suggestions,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: [err.message] || err,
                });
            }
        });
    }
    async updateLocationBatch(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { warehouseID, locations, employeeID } = data;
                // 1. Kiểm tra kho
                const warehouseExist = await Warehouse.findOne({ where: { warehouseID } });
                if (!warehouseExist) {
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Kho không tồn tại',
                    });
                }
                // 2. Duyệt từng location để kiểm tra và cập nhật
                for (const loc of locations) {
                    const { batchID, boxes } = loc;
                    const batch = await Batch.findOne({
                        where: { batchID, warehouseID },
                        include: [{ model: Unit, as: 'unit' }],
                    });
                    if (!batch) {
                        reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: `Batch ${batchID} không tồn tại hoặc không hợp lệ`,
                        });
                    }
                    // Tạo BatchMoveLog
                    const log = await db.BatchMoveLog.create(
                        {
                            batchID: batch.batchID,
                            actionType: 'FROM_TEMP',
                            note: 'Cập nhật vị trí batch từ kho tạm vào box',
                            fromLocation: null,
                            employeeCreate: data.employeeID,
                            quantity: batch.remainAmount,
                        },
                        { transaction },
                    );
                    for (const box of boxes) {
                        const { boxID, quantity } = box;

                        // kiểm tra số lượng vượt quá batch
                        if (quantity > batch.remainAmount) {
                            return reject({
                                status: 'ERR',
                                statusHttp: HTTP_BAD_REQUEST,
                                message: `Số lượng đặt (${quantity}) vượt quá số lượng còn lại của batch ${batchID} (${batch.remainAmount})`,
                            });
                        }

                        // kiểm tra box có tồn tại trong warehouse qua floor -> shelf -> zone
                        const boxExist = await Box.findOne({
                            where: { boxID },
                            include: [
                                {
                                    model: Floor,
                                    as: 'floor',
                                    include: [
                                        {
                                            model: Shelf,
                                            as: 'shelf',
                                            include: [
                                                {
                                                    model: Zone,
                                                    as: 'zone',
                                                    where: { warehouseID },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                            transaction,
                        });

                        if (!boxExist) {
                            return reject({
                                status: 'ERR',
                                statusHttp: HTTP_NOT_FOUND,
                                message: `Box ${boxID} không tồn tại trong kho ${warehouseID}`,
                            });
                        }

                        const unitVolume = batch.unit.length * batch.unit.width * batch.unit.height;
                        const requiredVolume = unitVolume * quantity;
                        if (boxExist.remainingAcreage < requiredVolume) {
                            reject({
                                status: 'ERR',
                                statusHttp: HTTP_BAD_REQUEST,
                                message: `Box ${box.boxID} không đủ diện tích (còn ${boxExist.remainingAcreage}, cần ${requiredVolume})`,
                            });
                        } else {
                            // Cập nhật BatchBox
                            await db.BatchBox.create(
                                {
                                    batchID: batch.batchID,
                                    boxID: boxExist.boxID,
                                    quantity,
                                    validQuantity: quantity,
                                },
                                { transaction },
                            );
                            // Tạo BatchMoveDetail
                            await db.BatchMoveDetail.create(
                                {
                                    logID: log.logID,
                                    toLocation: boxExist.boxID,
                                    quantity,
                                },
                                { transaction },
                            );
                            // Cập nhật remain của box
                            boxExist.remainingAcreage -= requiredVolume;
                            if (boxExist.remainingAcreage === 0) {
                                boxExist.status = 'FULL';
                            } else if (boxExist.status === 'AVAILABLE') {
                                boxExist.status = 'OCCUPIED';
                            }
                            await boxExist.save({ transaction });

                            // Cập nhật số lượng tempAmount và validAmount của batch
                            batch.tempAmount -= quantity;
                            batch.validAmount += quantity;
                            await batch.save({ transaction });
                        }
                    }
                }
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Cập nhật vị trí batch thành công',
                });
            } catch (err) {
                await transaction.rollback();
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: [err.message] || err,
                });
            }
        });
    }
    async changeLocation(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { oldLocations, newLocations, boxID, employeeID } = data;
                const listBatchMoveLog = [];

                // 1. Duyệt từng location cũ để cập nhật (chuyển hàng đi)
                for (const loc of oldLocations) {
                    let totalQuantityChange = 0;
                    const { batchID, quantity, validQuantity } = loc;
                    const batch = await Batch.findOne({
                        where: { batchID },
                        include: [{ model: Unit, as: 'unit' }],
                    });
                    if (!batch) {
                        reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: `Batch ${batchID} không tồn tại hoặc không hợp lệ`,
                        });
                    }

                    // kiểm tra box có tồn tại trong warehouse qua floor -> shelf -> zone
                    const boxExist = await Box.findOne({
                        where: { boxID },
                        include: [
                            {
                                model: Floor,
                                as: 'floor',
                                include: [
                                    {
                                        model: Shelf,
                                        as: 'shelf',
                                        include: [
                                            {
                                                model: Zone,
                                                as: 'zone',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    });

                    if (!boxExist) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: `Box ${boxID} không tồn tại trong kho`,
                        });
                    }
                    // tìm và lấy số lượng hiện tại trong batchbox
                    const batchBoxExist = await db.BatchBox.findOne({
                        where: { batchID: batch.batchID, boxID: boxExist.boxID },
                    });
                    if (!batchBoxExist) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: `BatchBox với batchID ${batchID} và boxID ${boxID} không tồn tại`,
                        });
                    }

                    // Validate: Không được chuyển hàng đang pending (pendingOutQuantity)
                    if (quantity < batchBoxExist.pendingOutQuantity) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Số lượng còn lại (${quantity}) không được nhỏ hơn số lượng đang chờ xuất (${batchBoxExist.pendingOutQuantity})`,
                        });
                    }

                    const unitVolume = batch.unit.length * batch.unit.width * batch.unit.height;
                    const currentQuantity = batchBoxExist.quantity;
                    const requiredVolume = (currentQuantity - quantity) * unitVolume;
                    totalQuantityChange += currentQuantity - quantity;

                    // Cập nhật BatchBox
                    await db.BatchBox.update(
                        {
                            quantity,
                            validQuantity,
                        },
                        { where: { batchID: batch.batchID, boxID: boxExist.boxID }, transaction },
                    );

                    // Tạo BatchMoveLog
                    const log = await db.BatchMoveLog.create(
                        {
                            batchID: batch.batchID,
                            actionType: 'FROM_BOX',
                            note: 'Cập nhật vị trí batch từ ' + boxID + ' sang box khác',
                            fromLocation: boxID,
                            employeeCreate: employeeID,
                            quantity: totalQuantityChange,
                        },
                        { transaction },
                    );
                    listBatchMoveLog.push({ batchID: batch.batchID, logID: log.logID });
                    // Cập nhật remain của box
                    boxExist.remainingAcreage += requiredVolume;

                    await db.Box.increment({ remainingAcreage: requiredVolume }, { where: { boxID }, transaction });

                    // Cập nhật status box
                    const updatedBox = await Box.findOne({ where: { boxID }, transaction });
                    // Nếu diện tích còn lại >= diện tích tối đa (tức là không còn hàng) -> AVAILABLE
                    if (updatedBox.remainingAcreage >= updatedBox.maxAcreage) {
                        await db.Box.update({ status: 'AVAILABLE' }, { where: { boxID }, transaction });
                    } else {
                        // Nếu còn hàng (diện tích còn lại < tối đa) -> OCCUPIED
                        await db.Box.update({ status: 'OCCUPIED' }, { where: { boxID }, transaction });
                    }
                }

                // 2. Duyệt từng location mới để thêm hàng vào
                for (const loc of newLocations) {
                    const { batchID, boxes } = loc;
                    const batch = await Batch.findOne({
                        where: { batchID },
                        include: [{ model: Unit, as: 'unit' }],
                    });
                    if (!batch) {
                        reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: `Batch ${batchID} không tồn tại hoặc không hợp lệ`,
                        });
                    }
                    for (const box of boxes) {
                        const { boxID, quantity } = box;

                        // kiểm tra số lượng vượt quá batch
                        if (quantity > batch.remainAmount) {
                            return reject({
                                status: 'ERR',
                                statusHttp: HTTP_BAD_REQUEST,
                                message: `Số lượng đặt (${quantity}) vượt quá số lượng còn lại của batch ${batchID} (${batch.remainAmount})`,
                            });
                        }

                        // kiểm tra box có tồn tại trong warehouse qua floor -> shelf -> zone
                        const boxExist = await Box.findOne({
                            where: { boxID },
                            include: [
                                {
                                    model: Floor,
                                    as: 'floor',
                                    include: [
                                        {
                                            model: Shelf,
                                            as: 'shelf',
                                            include: [
                                                {
                                                    model: Zone,
                                                    as: 'zone',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        });

                        if (!boxExist) {
                            return reject({
                                status: 'ERR',
                                statusHttp: HTTP_NOT_FOUND,
                                message: `Box ${boxID} không tồn tại trong kho `,
                            });
                        }

                        const unitVolume = batch.unit.length * batch.unit.width * batch.unit.height;
                        const requiredVolume = unitVolume * quantity;
                        if (boxExist.remainingAcreage < requiredVolume) {
                            reject({
                                status: 'ERR',
                                statusHttp: HTTP_BAD_REQUEST,
                                message: `Box ${box.boxID} không đủ diện tích (còn ${boxExist.remainingAcreage}, cần ${requiredVolume})`,
                            });
                        } else {
                            // tìm batchbox cũ nếu có thì cộng thêm vào
                            const oldBatchBox = await db.BatchBox.findOne({
                                where: { batchID: batch.batchID, boxID: boxExist.boxID },
                            });
                            if (oldBatchBox) {
                                oldBatchBox.quantity += quantity;
                                oldBatchBox.validQuantity += quantity;
                                await oldBatchBox.save({ transaction });
                            } else {
                                // Cập nhật BatchBox
                                await db.BatchBox.create(
                                    {
                                        batchID: batch.batchID,
                                        boxID: boxExist.boxID,
                                        quantity,
                                        validQuantity: quantity,
                                        pendingOutQuantity: 0,
                                    },
                                    { transaction },
                                );
                            }

                            // Tạo BatchMoveDetail
                            await db.BatchMoveDetail.create(
                                {
                                    logID: listBatchMoveLog.find((item) => item.batchID === batchID).logID,
                                    toLocation: boxExist.boxID,
                                    quantity,
                                },
                                { transaction },
                            );

                            // Cập nhật remain của box
                            boxExist.remainingAcreage -= requiredVolume;

                            await db.Box.increment(
                                { remainingAcreage: -requiredVolume },
                                { where: { boxID }, transaction },
                            );

                            // Cập nhật status
                            // Nếu hết chỗ (diện tích còn lại <= 0) -> FULL
                            if (boxExist.remainingAcreage <= 0) {
                                await db.Box.update({ status: 'FULL' }, { where: { boxID }, transaction });
                            } else {
                                // Còn chỗ -> OCCUPIED
                                await db.Box.update({ status: 'OCCUPIED' }, { where: { boxID }, transaction });
                            }
                        }
                    }
                }
                await transaction.commit();

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Cập nhật vị trí batch thành công',
                });
            } catch (err) {
                console.log(err);

                await transaction.rollback();
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: [err.message] || err,
                });
            }
        });
    }
    async getAllBoxByBatchID(batchID) {
        return new Promise(async (resolve, reject) => {
            try {
                const batch = await Batch.findOne({
                    where: { batchID },
                    include: [
                        {
                            model: Box,
                            as: 'boxes',
                            attributes: { exclude: ['createdAt', 'updatedAt'] },
                            through: {
                                attributes: ['quantity'],
                                where: { quantity: { [Op.gt]: 0 } },
                            },
                            include: [
                                {
                                    model: Floor,
                                    as: 'floor',
                                    include: [
                                        {
                                            model: Shelf,
                                            as: 'shelf', // sửa lại đúng chính tả (trước là 'sheleves')
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                });

                if (!batch) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: `Lô hàng ${batchID} không tồn tại`,
                    });
                }

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách box của batch thành công',
                    boxes: batch.boxes,
                });
            } catch (err) {
                console.error('Lỗi:', err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err.message || err,
                });
            }
        });
    }
}

module.exports = new BatchBoxService();
