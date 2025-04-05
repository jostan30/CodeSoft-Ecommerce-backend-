require('dotenv').config(); // loads environment variables from .env

const config = {
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET
};

module.exports = config;