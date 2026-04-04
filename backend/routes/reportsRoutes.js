const express = require('express');
const { createReport, getReports, updateReportStatus } = require('../controllers/reportsController');
const { protect, organization } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const router = express.Router();

router.post('/create', protect, upload.single('image'), createReport);
router.get('/', getReports);
router.patch('/:id/status', protect, organization, updateReportStatus);

module.exports = router;
