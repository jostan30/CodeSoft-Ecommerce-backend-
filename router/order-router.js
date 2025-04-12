const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  getSellerOrders,
  updateOrderToDelivered
} = require('../controller/order-controller');
const { protect, authorize } = require('../middleware/authMidlleware');


router.use(protect);

// Order of routes matters!
router.get('/sellerOrder', authorize('seller'), getSellerOrders);
router.get('/admin/all', authorize('admin'), getAllOrders);

// This must come after the above specific routes
router.get('/:id', getOrderById);

router.get('/', getUserOrders);

router.post('/', authorize('customer'), createOrder);

router.put('/:id/deliver', authorize('admin'), updateOrderToDelivered);

module.exports = router;

