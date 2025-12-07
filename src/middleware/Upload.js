const multer = require('multer')

const storage = multer.memoryStorage()

const checkFile = (req, file, cb) => {
    const fileType = ['jpg', 'jpeg', 'png', 'gif']
    const mimeType = fileType.includes(file.mimetype.split('/')[1])
    if(mimeType) {
        return cb("", true)
    }
    return cb(new Error("Chỉ nhận file hình ảnh"))
}

const upload = multer({
    storage,
    fileFilter: checkFile,
    limits: 1024 * 1024 * 5
}
).single('image')

module.exports = {upload}