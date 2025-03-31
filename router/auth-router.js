const express = require('express');
const router = express.Router();
const {register , login ,getMe, becomeSeller, changePassword, updateProfile} = require('../controller/auth-controller');
const {protect} = require('../middleware/authMidlleware')

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/becomeseller',protect ,becomeSeller);
router.put('/changepassword' ,protect , changePassword);
router.put('/updateprofile' ,protect , updateProfile);


module.exports = router;
