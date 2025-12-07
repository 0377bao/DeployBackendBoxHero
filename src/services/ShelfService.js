const db = require('../../models/index');
const Zone = db.Zone;
const Shelf = db.Shelf;
const Floor = db.Floor;
const Box = db.Box;
const dotenv = require('dotenv');
const sequelize = db.sequelize;

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class ShelfService {
    // get all shelf
    getAllShelfOfWarehouse(warehouseID) {
        return new Promise(async (resolve, reject) => {
            try {
                // sort by createdAt desc
                const shelves = await Shelf.findAll({
                    include: [
                        {
                            model: Zone,
                            as: 'zone',
                            where: { warehouseID: warehouseID },
                        },
                        {
                            model: Floor,
                            as: 'floor',
                            separate: true,
                            include: [
                                {
                                    model: Box,
                                    as: 'boxes',
                                    separate: true,
                                    order: [
                                        [
                                            // lấy số trong "Ô 10" rồi CAST sang INT
                                            sequelize.literal('CAST(SUBSTRING(boxName, 3) AS UNSIGNED)'),
                                            'ASC',
                                        ],
                                    ],
                                    include: [
                                        {
                                            model: db.BatchBox,
                                            as: 'batchBoxes',
                                        },
                                    ],
                                },
                            ],
                            order: [[sequelize.literal('CAST(SUBSTRING(floorID, 3) AS UNSIGNED)'), 'ASC']],
                        },
                    ],
                    order: [['createdAt']],
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: shelves,
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new ShelfService();
