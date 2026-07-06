const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getExpenses, createExpense, updateExpense, deleteExpense, getSummary } = require('../controllers/expenseController');
router.use(protect);
router.get('/summary', getSummary);
router.route('/').get(getExpenses).post(createExpense);
router.route('/:id').put(updateExpense).delete(deleteExpense);
module.exports = router;
