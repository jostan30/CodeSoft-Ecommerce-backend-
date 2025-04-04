const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// // Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is seller of the product
const checkProductOwnership = async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Allow admin to proceed
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user is the seller of this product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this product'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while checking permissions'
    });
  }
};

// Check if user is customer who placed the order
const checkOrderOwnership = async (req, res, next) => {
  try {
    const Order = require('../models/Order');
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Allow admin to proceed
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user is the customer who placed this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while checking permissions'
    });
  }
};


module.exports = {
  protect,
  authorize,
  checkProductOwnership,
  checkOrderOwnership
};