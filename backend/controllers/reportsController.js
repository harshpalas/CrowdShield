const Report = require('../models/Report');

const createReport = async (req, res) => {
    const { longitude, latitude, description } = req.body;

    try {
        const report = await Report.create({
            user: req.user._id,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
            imageUrl: req.file.path, // Path from Cloudinary
            description,
        });

        // Socket IO event will be emitted from the server.js instance
        // But for now, we just return the result
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

module.exports = { createReport, getReports };
