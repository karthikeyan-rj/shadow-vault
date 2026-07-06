const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { categorize, predictBudget, getHealthScore, getInsights } = require('../controllers/aiController');

router.use(protect);
router.post('/categorize', categorize);
router.get('/predict-budget', predictBudget);
router.get('/health-score', getHealthScore);
router.get('/insights', getInsights);

module.exports = router;
