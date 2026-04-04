const Report = require('../models/Report');

const createReport = async (req, res) => {
    console.log('Incoming Report Request Body:', req.body);
    console.log('Incoming Report File Info:', req.file);
    const { longitude, latitude, description, type } = req.body;

    try {
        const report = await Report.create({
            user: req.user._id,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            imageUrl: req.file ? req.file.path : '', // Handle optional file
            description,
            type: type || 'normal',
        });

        // Emit socket event to all clients
        req.io.emit('newReport', report);

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const reports = await Report.find({}).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReportStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Signal Lost: Report not found' });
        }

        // Emit socket event to all clients to sync state
        req.io.emit('reportStatusUpdate', report);

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReport, getReports, updateReportStatus };
