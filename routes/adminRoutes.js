const express = require('express')
const {register,login,verifyEmailOTP, forgetPassword, resetPasswordWithOTP}  = require('../controllers/AdminAuthController.js')
const router =  express.Router()

router.post('/register',register)
router.post('/login', login);
router.post('/verify-email', verifyEmailOTP);
router.post('/forgot-password', forgetPassword);
router.post('/reset-password', resetPasswordWithOTP);

module.exports  = router