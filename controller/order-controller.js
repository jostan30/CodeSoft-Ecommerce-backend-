const Order = require('../models/Order');
const { authorize } = require('../middleware/authMidlleware');

// @desc    Create a new order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ msg: 'No order items' });
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    const createdOrder = await order.save();
    res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get order by ID
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if this is the user's order or admin
    if (order.user._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Get logged in user's orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const seller= req.user.id;
    const allOrders = await Order.find()
    .populate({
      path: 'orderItems.product',
      model: 'product',
      select: 'seller name price', // only fetch necessary fields
    });

     // Filter orders where at least one product belongs to the current seller
     const sellerOrders = allOrders.filter(order => {
      return order.orderItems.some(item => {
        return item.product && item.product.seller.toString() === seller;
      });
    });

    return res.json(sellerOrders);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

// @desc    Get all orders
// @access  Private (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    authorize('admin');
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update order to delivered
// @access  Private (Admin only)
exports.updateOrderToDelivered = async (req, res) => {
  try {
    authorize('admin');
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
};

