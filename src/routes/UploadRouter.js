const UploadController = require('../controllers/UploadController')
const { upload } = require('../middleware/Upload')

const router = require('express').Router()

router.post('/upload',upload, UploadController.uploadImage)

module.exports = router