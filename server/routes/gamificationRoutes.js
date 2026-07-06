const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateActivity, getStats, getMotivation } = require('../controllers/gamificationController');

router.use(protect);
router.post('/activity', updateActivity);
router.get('/stats', getStats);
router.get('/motivation', getMotivation);

module.exports = router;
