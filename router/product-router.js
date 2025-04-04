const express = require('express');
const {
  getProducts,
  getProductById ,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controller/product-controller');

const { protect, authorize } = require('../middleware/authMidlleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

router.route('/').get(getProducts)
router.post('/', protect, authorize('seller'), createProduct);

// router.route('/stats')
//   .get(authorize('admin'), getProductStats);

router.route('/:id')
  .get(getProductById )
  .put(protect ,authorize('seller') ,updateProduct)
  .delete(protect,authorize('seller'),deleteProduct);


module.exports = router;