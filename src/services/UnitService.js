const db = require('../../models/index');
const Unit = db.Unit;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class UnitService {
    // get all unit
    getAllUnit() {
        return new Promise(async (resolve, reject) => {
            try {
                const unitFind = await Unit.findAll();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: unitFind,
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    // get units by product
    getUnitsByProduct(productID) {
        return new Promise(async (resolve, reject) => {
            try {
                const unitFind = await Unit.findAll({
                    include: [
                        {
                            model: db.Batch,
                            as: 'batches',
                            where: { productID: productID },
                            attributes: [],
                        },
                    ],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: unitFind,
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    // get total valid amount by product and unit
    getTotalValidAmountByProductAndUnit(items) {
        return new Promise(async (resolve, reject) => {
            try {
                const promises = items.map(async (item) => {
                    const totalValidAmount = await db.Batch.sum('validAmount', {
                        where: {
                            productID: item.productID,
                            unitID: item.unitID,
                            status: 'AVAILABLE',
                            validAmount: {
                                [db.Sequelize.Op.gt]: 0,
                            },
                        },
                    });
                    return {
                        productID: item.productID,
                        unitID: item.unitID,
                        totalValidAmount: totalValidAmount || 0,
                    };
                });

                const results = await Promise.all(promises);

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy số lượng hợp lệ thành công',
                    data: results,
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new UnitService();
