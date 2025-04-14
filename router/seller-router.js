const express = require('express');
const router = express.Router();
const { getSellerDashboardStats } = require('../controller/seller-controller');
const{ protect, authorize } = require('../middleware/authMidlleware');


router.use(protect);

router.get('/stats',authorize('seller'),getSellerDashboardStats  );


module.exports = router;