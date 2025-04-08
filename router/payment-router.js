const express = require('express');
const router = express.Router();
const {  createRazorpayOrder,verifyRazorpayPayment,getRazorpayKey} = require('../controller/payment-controller');
const { protect} = require('../middleware/authMidlleware');


router.use(protect);

// @route   POST api/payment/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', createRazorpayOrder);

// @route   POST api/payment/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify',  verifyRazorpayPayment);

// @route   GET api/payment/key
// @desc    Get Razorpay API key for frontend
// @access  Public
router.get('/key', getRazorpayKey);

module.exports =router;
