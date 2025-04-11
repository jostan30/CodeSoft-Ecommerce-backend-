const express = require('express');
const multer = require('multer');
const upload = multer();

const {
  getProducts,
  getProductById ,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts
} = require('../controller/product-controller');

const { protect, authorize } = require('../middleware/authMidlleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

router.route('/').get(getProducts)
router.post('/', upload.single('image'), authorize('seller'), createProduct);
router.get('/userproduct', authorize('seller'),getSellerProducts );

// router.route('/stats')
//   .get(authorize('admin'), getProductStats);

router.route('/:id')
  .get(getProductById )
  .put( upload.single('image') ,authorize('seller') ,updateProduct)
  .delete(protect,authorize('seller'),deleteProduct);


module.exports = router;