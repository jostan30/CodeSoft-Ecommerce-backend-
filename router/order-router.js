const express = require('express');
const router =express.Router();
const {
    createOrder,
    getOrderById,
    getUserOrders,
    getAllOrders,
    updateOrderToDelivered
  } = require('../controller/order-controller');
  const {protect,authorize} = require('../middleware/authMidlleware');
  

  router.use(protect);

  // @route   POST api/orders
  // @desc    Create a new order
  // @access  Private
  router.post('/'  ,authorize('customer') ,createOrder);
  
  // @route   GET api/orders/:id
  // @desc    Get order by ID
  // @access  Private
  router.get('/:id',  getOrderById);
  
  // @route   GET api/orders
  // @desc    Get logged in user's orders
  // @access  Private
  router.get('/',getUserOrders);
  
  // @route   GET api/orders/admin/all
  // @desc    Get all orders
  // @access  Private (Admin only)
  router.get('/admin/all',authorize('admin'),  getAllOrders);
  
  // @route   PUT api/orders/:id/deliver
  // @desc    Update order to delivered
  // @access  Private (Admin only)
  router.put('/:id/deliver',authorize('admin'),  updateOrderToDelivered);
  
  module.exports = router;
  
