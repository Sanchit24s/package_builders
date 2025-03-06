const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'Access Denied: No token provided.' });
    }

    token = token.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ msg: 'Access Denied: Invalid admin.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Error in protect middleware:', error);
    res.status(401).json({ msg: 'Authentication failed.' });
  }
};