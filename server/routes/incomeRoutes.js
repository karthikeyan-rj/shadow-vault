const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getIncomes, createIncome, updateIncome, deleteIncome } = require('../controllers/incomeController');
router.use(protect);
router.route('/').get(getIncomes).post(createIncome);
router.route('/:id').put(updateIncome).delete(deleteIncome);
module.exports = router;
