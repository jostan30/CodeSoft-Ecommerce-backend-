const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
} = require('../controller/product-controller');

const { protect, authorize } = require('../middleware/authMidlleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/stats')
  .get(authorize('admin'), getProductStats);

router.route('/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;