const Admin = require('../models/Admin.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { sendVerificationEmail, sendOTPEmail, sendPasswordResetEmail } = require('../utils/sendEmail.js')

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
  
      // Generate JWT token
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(201).json({
        msg: 'Registration successful! Please login to verify your email.',
        token,
        admin: { id: admin._id, fullName, username, email },
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ msg: 'Internal Server Error' });
    }
  };

//Admin login
exports.login = async(req,res)=>{
    try {
        const{email, password}  =req.body

        //find admin
        const admin = await Admin.findOne({email})
        if(!admin) return res.status(400).json({msg: 'Admin not found'})
        
        //check password
        const isMatch = await bcrypt.compare(password, admin.password)
        if(!isMatch) return res.status(400).json({msg: 'Invalid CredentialsContainer.'})
        
        if(!admin.isVerified) {
            //send otp for email verfication
            const otpResult = await sendOTPEmail(admin)
            if(!otpResult.success){
                return res.status(500).json({ msg: otpResult.message });
            }

            return res.status(200).json({
                msg: 'Admin not verified. OTP sent to your email for verification.',
                isVerified: false,
              });
        }
        
        const token = jwt.sign({id: admin._id},process.env.JWT_SECRET, {expiresIn: '1h'})
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
}

// Verify Email OTP
exports.verifyEmailOTP = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      // Find admin by email and OTP
      const admin = await Admin.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
      if (!admin) {
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

//forget PASSWORD
exports.forgetPassword = async(req,res)=>{
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
    admin.otpExpires = Date.now() + 3600000; // 1 hour
    await admin.save();
    
    // Send OTP email
    const mailOptions = {
        from: `"Your Company" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: 'Password Reset OTP',
        html: `
          <p>Hello ${admin.fullName},</p>
          <p>Your OTP for password reset is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 1 hour.</p>
        `,
      };
  
      await sendOTPEmail(mailOptions);
      res.status(200).json({ msg: 'OTP sent to your email for password reset.' });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
     res.status(500).json({ msg: 'Internal Server Error' });
    }
}

// Reset Password with OTP
exports.resetPasswordWithOTP = async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
  
      // Find admin by email and OTP
      const admin = await Admin.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
      if (!admin) {
        return res.status(400).json({ msg: 'Invalid or expired OTP.' });
      }
  
      // Hash new password and save
      admin.password = await bcrypt.hash(newPassword, 10);
      admin.otp = undefined;
      admin.otpExpires = undefined;
      await admin.save();
  
      res.status(200).json({ msg: 'Password reset successful.' });
    } catch (error) {
      console.error('Error in resetPasswordWithOTP:', error);
      res.status(500).json({ msg: 'Internal Server Error' });
    }
  };