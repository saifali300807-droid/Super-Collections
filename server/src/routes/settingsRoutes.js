const express = require('express');
const { getSettings, getCommerce, updateSettings } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSettings);
router.get('/commerce', getCommerce);
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
