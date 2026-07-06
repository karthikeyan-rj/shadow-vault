const express = require('express');
const router = express.Router();
const { getTasks, getTodayTasks, createTask, updateTask, toggleTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTasks);
router.get('/today', protect, getTodayTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.patch('/:id/toggle', protect, toggleTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
