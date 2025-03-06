const Admin = require('../models/Admin.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendOTPEmail, sendPasswordResetEmail } = require('../utils/sendEmail.js');

// Register Admin
exports.register = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Debugging: Log the request body
    const { fullName, username, email, password } = req.body;

    // Validate fields
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ msg: 'All fields are required.' });
    }

    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: 'Email already exists.' });
    }

    // Create new admin
    admin = new Admin({ fullName, username, email, password });

    // Save admin to database
    await admin.save();

    // Send verification email
    const verificationResult = await sendVerificationEmail(admin);
    if (!verificationResult.success) {
      return res.status(500).json({ msg: verificationResult.message });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      msg: 'Registration successful! Please check your email for verification.',
      token,
      admin: { id: admin._id, fullName, username, email },
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};

// Admin login
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find admin
      const admin = await Admin.findOne({ email });
      if (!admin) return res.status(400).json({ msg: 'Admin not found' });
  
      console.log('Stored Hashed Password:', admin.password); // Debugging
      console.log('Entered Password:', password); // Debugging
  
      // Check password
      const isMatch = await bcrypt.compare(password, admin.password);
      console.log('Password Match:', isMatch); // Debugging
  
      if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials.' });
  
      if (!admin.isVerified) {
        // Send OTP for email verification
        const otpResult = await sendOTPEmail(admin);
        if (!otpResult.success) {
          return res.status(500).json({ msg: otpResult.message });
        }
  
        return res.status(200).json({
          msg: 'Admin not verified. OTP sent to your email for verification.',
          isVerified: false,
        });
      }
  
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({
        msg: 'Login successful.',
        token,
        admin: { id: admin._id, fullName: admin.fullName, email: admin.email },
        isVerified: true,
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ msg: 'Internal Server Error' });
    }
  };
// Verify Email OTP
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Debugging: Log the email and OTP
    console.log('Email:', email);
    console.log('OTP:', otp);

    // Find admin by email and OTP
    const admin = await Admin.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    if (!admin) {
      console.log('Admin not found or OTP invalid/expired');
      return res.status(400).json({ msg: 'Invalid or expired OTP.' });
    }

    // Mark admin as verified
    admin.isVerified = true;
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    res.status(200).json({ msg: 'Email verified successfully.' });
  } catch (error) {
    console.error('Error in verifyEmailOTP:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};

// Forgot Password
exports.forgetPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Find admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ msg: 'Admin not found.' });
      }
  
      // Generate OTP for password reset
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      admin.otp = otp;
      admin.otpExpires = Date.now() + 3600000; // 1 hour expiry
      await admin.save();
  
      // Send password reset email
      const resetResult = await sendPasswordResetEmail(admin);
      if (!resetResult.success) {
        return res.status(500).json({ msg: resetResult.message });
      }
  
      res.status(200).json({ msg: 'Password reset OTP sent to your email.' });
    } catch (error) {
      console.error('Error in forgetPassword:', error);
      res.status(500).json({ msg: 'Internal Server Error' });
    }
  };
  

// Reset Password with OTP

exports.resetPasswordWithOTP = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Find admin by email and OTP
        const admin = await Admin.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
        if (!admin) {
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }

        // Hash new password manually and save without triggering pre('save') hook
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Admin.updateOne(
            { email },
            { $set: { password: hashedPassword, otp: undefined, otpExpires: undefined } }
        );

        res.status(200).json({ msg: 'Password reset successful.' });
    } catch (error) {
        console.error('Error in resetPasswordWithOTP:', error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};

  