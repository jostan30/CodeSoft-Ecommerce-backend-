const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    orderItems: [
        {
          name: { type: String, required: true },
          quantity: { type: Number, required: true },
          image: { type: String, required: true },
          price: { type: Number, required: true },
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
          }
        }
      ],
      shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
      },
      paymentMethod: {
        type: String,
        required: true
      },
      paymentResult: {
        razorpay_payment_id: { type: String },
        razorpay_order_id: { type: String },
        razorpay_signature: { type: String },
        status: { type: String },
        email_address: { type: String }
      },
      taxPrice: {
        type: Number,
        required: true,
        default: 0.0
      },
      shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
      },
      totalPrice: {
        type: Number,
        required: true,
        default: 0.0
      },
      isPaid: {
        type: Boolean,
        required: true,
        default: false
      },
      paidAt: {
        type: Date
      },
      isDelivered: {
        type: Boolean,
        required: true,
        default: false
      },
      deliveredAt: {
        type: Date
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    });
    
module.exports = mongoose.model('order', OrderSchema);