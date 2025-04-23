const express = require('express');
const {Task, CreateTask, UpdateTask} = require('../models/Task');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const handler = require('express-async-handler')

/* -------------------------------------- */
const posttask = handler(
async (req, res) => {
    try {
        // Validate the request body
        const { error } = CreateTask(req.body);
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        const { title, description, status, priority, dueDate } = req.body;

        // Create new task with owner
        const task = new Task({
            title,
            description,
            status,
            priority,
            dueDate,
            owner: req.user._id  // Add the owner field from authenticated user
        });

        // Save the task
        const savedTask = await task.save();
        
        // Send response
        res.status(201).json({
            status: 'success',
            data: savedTask
        });

    } catch (error) {
        console.error('Task Creation Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء إنشاء المهمة'
        });
    }
});

/* -------------------------------------- */
const gettask = handler(async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user._id })
            .sort({ createdAt: -1 })
            .select('-__v'); // Exclude version field

        res.status(200).json({
            status: 'success',
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error('Get Tasks Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء جلب المهام'
        });
    }
});

/* -------------------------------------- */
const updateTaskStatus = handler(async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        // Validate status
        if (!['Finished', 'In progress', 'Postponed'].includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'حالة غير صالحة. يجب أن تكون إما "Finished" أو "In progress" أو "Postponed"'
            });
        }

        // Find task and verify ownership
        const task = await Task.findOne({ _id: taskId, owner: req.user._id });
        
        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'المهمة غير موجودة أو ليست لديك صلاحية تحديثها'
            });
        }

        // Update task status
        task.status = status;
        const updatedTask = await task.save();

        res.status(200).json({
            status: 'success',
            message: 'تم تحديث حالة المهمة بنجاح',
            data: updatedTask
        });

    } catch (error) {
        console.error('Update Task Status Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء تحديث حالة المهمة'
        });
    }
});

/* -------------------------------------- */
const deleteTask = handler(async (req, res) => {
    try {
        const { taskId } = req.params;

        // Find and delete task, ensuring user owns it
        const task = await Task.findOneAndDelete({ _id: taskId, owner: req.user._id });

        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'المهمة غير موجودة أو ليست لديك صلاحية حذفها'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'تم حذف المهمة بنجاح'
        });

    } catch (error) {
        console.error('Delete Task Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء حذف المهمة'
        });
    }
});

/* -------------------------------------- */

module.exports = {posttask, gettask, updateTaskStatus, deleteTask};