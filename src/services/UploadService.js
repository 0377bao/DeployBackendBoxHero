const {s3} = require('../config/aws.helper')
const dotenv = require('dotenv')
dotenv.config()

const HTTP_OK = process.env.HTTP_OK;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class UploadService {
    uploadImage(file) {
        return new Promise(async (resolve, reject) => {
            try{
                const filePath = `${Date.now()}-${file.originalname}`
                const resultUpload = await s3.upload({
                    Bucket: process.env.Bucket_S3,
                    Key: filePath,
                    Body: file.buffer,
                    ContentType: file.mimetype
                }).promise()
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tải ảnh thành công',
                    imageUrl: resultUpload.Location
                })
            }catch(err) {
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err
                })
            }
        })
    }
}

module.exports = new UploadService();