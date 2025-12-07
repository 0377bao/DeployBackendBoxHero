const md5 = require('md5');
const QRCode = require('qrcode');

const generateCode = (prefix) => {
    const randomChar = md5(Date.now().toString()).slice(-5);
    return `${prefix}${randomChar}`;
};

const generateBatchID = (prefix, batchLength) => {
    return `${prefix}${Number(batchLength) + 1}`;
};

const generateQRURL = async (text) => {
    try {
        const url = await QRCode.toDataURL(text);
        return url;
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    generateCode,
    generateBatchID,
    generateQRURL,
};
