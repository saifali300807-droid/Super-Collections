const express = require('express');
const {
  createOrder, getMyOrders, getOrderById, updateOrderToPaid, cancelOrder,
} = require('../controllers/orderController');
const { protect, verifiedOnly } = require('../middleware/auth');
const { rateLimit } = require('../middleware/security');

const router = express.Router();

router.post('/', rateLimit(20), protect, verifiedOnly, createOrder);
router.route('/mine').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/cancel').put(protect, cancelOrder);

module.exports = router;
