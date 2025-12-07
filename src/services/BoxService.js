const db = require('../../models');
const Box = db.Box;
const { generateQRURL } = require('../common');
const dotenv = require('dotenv');
dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class BoxService {
    generateQRForBoxes() {
        return new Promise(async (resolve, reject) => {
            try {
                const boxes = await Box.findAll();
                const updates = boxes.map(async (box) => {
                    const qrCode = await generateQRURL(box.boxID);
                    box.qr = qrCode;
                    return box.save();
                });

                await Promise.all(updates);

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Generated QR codes for all boxes successfully',
                    data: boxes,
                });
            } catch (e) {
                console.log(e);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Error generating QR codes',
                    error: e,
                });
            }
        });
    }
}

module.exports = new BoxService();
