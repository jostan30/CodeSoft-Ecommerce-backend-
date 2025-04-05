
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const config = require('../config/Razorpaykeys');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret
});

// @desc    Create Razorpay order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency || 'INR',
      receipt: receipt,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);
    // console.log(order);
    if (!order) {
      return res.status(500).json({ msg: 'Error creating Razorpay order' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Verify Razorpay payment
// @access  Private
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ msg: 'Payment verification failed' });
    }

    // Update order status
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
   
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: 'COMPLETED'
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get Razorpay API key for frontend
// @access  Public
const getRazorpayKey = (req, res) => {
  res.json({ key: config.razorpayKeyId });
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayKey
};

