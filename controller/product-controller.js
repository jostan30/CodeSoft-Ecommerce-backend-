const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get all products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ date: -1 });

    // Convert image buffer to base64 string for JSON response
    const productData = products.map((product) => ({
      ...product.toObject(),
      image: product.image?.toString("base64") || null,
    }));

    return res.status(200).json({
      success: true,
      data: productData
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    // Add user to req.body
    req.body.seller = req.user.id;

    // Convert numeric fields from string to number
    req.body.price = parseFloat(req.body.price);
    req.body.quantity = parseInt(req.body.quantity);
    req.body.discountPrice = parseFloat(req.body.discountPrice || 0);

    if (req.file?.buffer) {
      req.body.image = req.file.buffer;
    }
    console.log("Received Body:", req.body);
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a product
// @access  Private (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const seller = req.user.id;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if authentic
    if (seller !== product.seller.toString()) {
      return res.status(401).json({ msg: 'Admin access required' });
    }

    const { name, description, price, category, image, countInStock, quantity, discountPrice, subcategory } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (subcategory) product.subcategory = subcategory;
    if (image) product.image = image;
    if (discountPrice) product.discountPrice = discountPrice;
    if (quantity) product.quantity = quantity;
    if (countInStock !== undefined) product.countInStock = countInStock;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = req.user.id;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is authorized to delete this product
    if (seller !== product.seller.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private/Admin
// exports.getProductStats = async (req, res) => {
//   try {
//     // Only admin can access statistics
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to access product statistics'
//       });
//     }

//     // Get total product count
//     const totalProducts = await Product.countDocuments();

//     // Get products by category
//     const categoryStats = await Product.aggregate([
//       { $group: { _id: '$category', count: { $sum: 1 } } },
//       { $sort: { count: -1 } }
//     ]);

//     // Get low stock products (quantity less than 10)
//     const lowStockProducts = await Product.countDocuments({ quantity: { $lt: 10 } });

//     // Get total inventory value
//     const inventoryValue = await Product.aggregate([
//       { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         totalProducts,
//         categoryStats,
//         lowStockProducts,
//         inventoryValue: inventoryValue.length > 0 ? inventoryValue[0].total : 0
//       }
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };