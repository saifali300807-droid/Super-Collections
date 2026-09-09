const express = require('express');
const { getCart, replaceCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { rateLimit } = require('../middleware/security');

const router = express.Router();

/* Cart sirf LOGGED-IN users ki hoti hai (guest browser localStorage use karta hai).
   protect isliye ki koi guest/doosra user kisi aur ki cart padh/save na kare. */
router.use(protect);
router.use(rateLimit(200));

router.get('/', getCart);
router.put('/', replaceCart);
router.delete('/', clearCart);

module.exports = router;