const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Check if Authorization header exists and has correct format
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        message: 'غير مصرح - تنسيق رمز المصادقة غير صحيح'
      });
    }

    // Extract and validate token
    const token = authHeader.replace('Bearer ', '');
    if (!token || typeof token !== 'string') {
      return res.status(401).json({ 
        status: 'error',
        message: 'غير مصرح - الرمز مفقود أو غير صالح'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validate decoded token structure
    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        status: 'error',
        message: 'رمز غير صالح - البنية غير صحيحة'
      });
    }

    // Find user and check if still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'المستخدم غير موجود'
      });
    }

    // Attach user and token data to request
    req.user = user;
    req.token = token;
    req.tokenData = decoded;
    
    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'رمز غير صالح'
      });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'انتهت صلاحية الرمز'
      });
    }

    // Log unexpected errors
    console.error('Auth Middleware Error:', err);
    return res.status(500).json({ 
      status: 'error',
      message: 'خطأ في المصادقة'
    });
  }
};

module.exports = authMiddleware;
