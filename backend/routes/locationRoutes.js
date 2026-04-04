const express = require('express');
const { updateLocation, getHeatmapData } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/update', protect, updateLocation);
router.get('/heatmap', getHeatmapData);

module.exports = router;
