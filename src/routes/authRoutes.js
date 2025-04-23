const express = require('express');
const router = express()
const {register, login, updateAccount, deleteAccount} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
/* -------------------------------------- */

router.post('/register', register);
router.post('/login', login);
router.put('/update', authMiddleware, updateAccount);
router.delete('/delete', authMiddleware, deleteAccount);

/* -------------------------------------- */

module.exports = router
