const Report = require('../models/Report');
const User = require('../models/User');

const createReport = async (req, res) => {
    console.log('Incoming Report Request Body:', req.body);
    console.log('Incoming Report File Info:', req.file);
    const { longitude, latitude, description, type } = req.body;

    try {
        const report = await Report.create({
            user: req.user._id,
            ctz_id: req.user.userId || req.user._id.toString(),
            ord_id: null,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            image_url: req.file ? req.file.path : '', // Handle optional file
            description,
            type: type || 'normal',
        });

        // Update user's total reports count (Citizens only)
        if (req.user.role === 'citizen') {
            await User.findByIdAndUpdate(req.user._id, { $inc: { totalReports: 1 } });
        }

        // Emit socket event to all clients
        req.io.emit('newReport', report);

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const reports = await Report.find({}).sort({ created_at: -1 });
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

        // Logic for rewards when status is 'cleared'
        if (status === 'cleared' && report.status !== 'cleared') {
            // Reward the Reporter (Citizen)
            const reporter = await User.findById(report.user);
            if (reporter && reporter.role === 'citizen') {
                reporter.correctReports += 1;
                reporter.coins += 10;
                reporter.confidenceScore = (reporter.correctReports / reporter.totalReports) * 100;
                await reporter.save();
            }

            // Reward the Resolver (Organization)
            const resolver = await User.findById(req.user._id);
            if (resolver && resolver.role === 'org') {
                resolver.clearedReports += 1;
                resolver.coins = (resolver.respondedReports * 5) + (resolver.clearedReports * 10);
                await resolver.save();
            }
        } else if (status === 'monitoring' && report.status === 'pending') {
            // Track response for Org
            const resolver = await User.findById(req.user._id);
            if (resolver && resolver.role === 'org') {
                resolver.respondedReports += 1;
                resolver.coins = (resolver.respondedReports * 5) + (resolver.clearedReports * 10);
                await resolver.save();
            }
        }

        // Emit socket event to all clients to sync state
        req.io.emit('reportStatusUpdate', report);

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReport, getReports, updateReportStatus };
