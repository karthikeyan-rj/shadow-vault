const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getBills, createBill, updateBill, deleteBill, markPaid } = require('../controllers/billController');

router.use(protect);
router.route('/').get(getBills).post(createBill);
router.route('/:id').put(updateBill).delete(deleteBill);
router.patch('/:id/paid', markPaid);

module.exports = router;
