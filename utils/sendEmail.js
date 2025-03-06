const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send verification email
const sendVerificationEmail = async (admin) => {
  try {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    admin.verificationToken = verificationToken;
    await admin.save();

    const verificationUrl = `${process.env.BASE_URL}/api/admin/verify-email/${verificationToken}`;

    const mailOptions = {
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: 'Email Verification',
      html: `
        <p>Hello ${admin.fullName},</p>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    };

    await transport.sendMail(mailOptions);
    return { success: true, message: 'Verification email sent.' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, message: 'Failed to send verification email.' };
  }
};

// Send OTP email
const sendOTPEmail = async (admin) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpires = Date.now() + 3600000; // 1 hour
    await admin.save();

    const mailOptions = {
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: 'Your OTP',
      html: `
        <p>Hello ${admin.fullName},</p>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 1 hour.</p>
      `,
    };

    await transport.sendMail(mailOptions);
    return { success: true, message: 'OTP email sent.' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, message: 'Failed to send OTP email.' };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (admin) => {
    try {
      const resetUrl = `${process.env.BASE_URL}/api/admin/reset-password/${admin.otp}`;
  
      const mailOptions = {
        from: `"Your Company" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: 'Password Reset',
        html: `
          <p>Hello ${admin.fullName},</p>
          <p>Use the OTP below to reset your password:</p>
          <h2>${admin.otp}</h2>
          <p>This OTP will expire in 1 hour.</p>
        `,
      };
  
      await transport.sendMail(mailOptions);
      return { success: true, message: 'Password reset email sent.' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, message: 'Failed to send password reset email.' };
    }
  };
  

module.exports = { sendVerificationEmail, sendOTPEmail, sendPasswordResetEmail };