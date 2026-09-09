const express = require('express');
const { uploadImage, uploadImages, uploadVideo } = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, adminOnly, ...uploadImage);
router.post('/many', protect, adminOnly, ...uploadImages);
router.post('/video', protect, adminOnly, ...uploadVideo);

module.exports = router;
