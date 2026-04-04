const express = require('express');
const { createReport, getReports } = require('../controllers/reportsController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const router = express.Router();

router.post('/create', protect, upload.single('image'), createReport);
router.get('/', getReports);

module.exports = router;
