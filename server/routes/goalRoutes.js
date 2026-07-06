const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getGoals, createGoal, updateGoal, deleteGoal, depositToGoal } = require('../controllers/goalController');
router.use(protect);
router.route('/').get(getGoals).post(createGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);
router.patch('/:id/deposit', depositToGoal);
module.exports = router;
