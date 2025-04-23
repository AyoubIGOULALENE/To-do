const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {User, Register, Login, Update} = require('../models/User');
const router = express();
const handler = require('express-async-handler')
require('dotenv').config();
/* -------------------------------------- */
const register = handler(async (req, res) => {
    // Validate request body
    const { error } = Register(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
  
    const { username, email, password } = req.body;
  
    try {
      // Check if email already exists
      const userexist = await User.findOne({ email });
      if (userexist) {
        return res.status(409).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });
      }
  
      // Check if username already exists
      const usernameExist = await User.findOne({ username });
      if (usernameExist) {
        return res.status(409).json({ error: 'اسم المستخدم مستخدم مسبقاً' });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Save new user
      const user = new User({ username, email, password: hashedPassword });
      const result = await user.save();
  
      // Create JWT token
      const token = jwt.sign({
        id: user._id,
        isadmin: user.isadmin
      }, process.env.JWT_SECRET);
  
      // Remove password before sending user info
      const { password: _, ...other } = result._doc;
      
      res.status(201).json({ 
        status: 'success',
        data: { ...other, token }
      });
  
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(409).json({ 
          status: 'error',
          message: 'حقل مكرر: ' + Object.keys(err.keyValue)[0]
        });
      }
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء إنشاء الحساب'
      });
    }
});
  
const login = handler(async (req, res) => {
    const { error } = Login(req.body);
    if (error) {
      return res.status(400).json({ 
        status: 'error',
        message: error.details[0].message 
      });
    }
  
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ 
          status: 'error',
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" 
        });
      }
  
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          status: 'error',
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" 
        });
      }

      // Create token
      const token = jwt.sign(
        {
          id: user._id,
          isadmin: user.isadmin
        },
        process.env.JWT_SECRET
      );
      
      // Remove password from response
      const { password: _, ...userData } = user._doc;
    
      res.status(200).json({
        status: 'success',
        data: { ...userData, token }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء تسجيل الدخول'
      });
    }
});

/* -------------------------------------- */
const updateAccount = handler(async (req, res) => {
    try {
        const { error } = Update(req.body);
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        const { username, email, password } = req.body;

        // Check if new email is already taken by another user
        const emailExists = await User.findOne({ 
            email, 
            _id: { $ne: req.user._id } 
        });
        if (emailExists) {
            return res.status(409).json({
                status: 'error',
                message: 'البريد الإلكتروني مستخدم مسبقاً'
            });
        }

        // Check if new username is already taken
        const usernameExists = await User.findOne({ 
            username, 
            _id: { $ne: req.user._id } 
        });
        if (usernameExists) {
            return res.status(409).json({
                status: 'error',
                message: 'اسم المستخدم مستخدم مسبقاً'
            });
        }

        // Hash new password if provided
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                username,
                email,
                password: hashedPassword
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            status: 'success',
            message: 'تم تحديث الحساب بنجاح',
            data: updatedUser
        });

    } catch (error) {
        console.error('Update Account Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء تحديث الحساب'
        });
    }
});

/* -------------------------------------- */
const deleteAccount = handler(async (req, res) => {
    try {
        // Delete user's tasks first
        await Task.deleteMany({ owner: req.user._id });
        
        // Delete the user
        await User.findByIdAndDelete(req.user._id);

        res.status(200).json({
            status: 'success',
            message: 'تم حذف الحساب والمهام المرتبطة به بنجاح'
        });

    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء حذف الحساب'
        });
    }
});

/* -------------------------------------- */

module.exports = {register, login, updateAccount, deleteAccount};