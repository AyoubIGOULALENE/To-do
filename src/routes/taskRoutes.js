const express = require('express');
const router = express()
const {posttask, gettask, updateTaskStatus, deleteTask} = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
/* -------------------------------------- */

router.post('/', authMiddleware, posttask);
router.get('/', authMiddleware, gettask);
router.patch('/:taskId/status', authMiddleware, updateTaskStatus);
router.delete('/:taskId', authMiddleware, deleteTask);

/* -------------------------------------- */

module.exports = router