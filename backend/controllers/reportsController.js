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
            org_id: null,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            image_url: req.file ? req.file.path : '', // Handle optional file
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
        const reports = await Report.find({})
            .populate('user', 'userId confidenceScore')
            .sort({ created_at: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReportStatus = async (req, res) => {
    const { status, is_verified } = req.body;

    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Signal Lost: Report not found' });
        }

        const oldStatus = report.status;

        // 1. Handle Verification (Citizen Rewards/Penalties)
        if (typeof is_verified === 'boolean' && report.is_verified === null) {
            report.is_verified = is_verified;
            
            const reporter = await User.findById(report.user);
            if (reporter && reporter.role === 'citizen') {
                if (is_verified) {
                    // Correct Report
                    reporter.correctReports = (reporter.correctReports || 0) + 1;
                    reporter.coins = (reporter.coins || 0) + 10;
                } else {
                    // False Report
                    reporter.falseReports = (reporter.falseReports || 0) + 1;
                }
                
                // Total reports is incremented on creation (line 25), but let's re-verify logic
                // If totalReports doesn't count failed/correct correctly, we'll align it.
                // The user says "Increment total reports by 1" specifically during verification.
                // However, createReport already increments it. 
                // Let's follow the user's explicit rule to be safe about the formula.
                // reporter.totalReports = (reporter.correctReports || 0) + (reporter.falseReports || 0); 
                // Actually, the user says "Increment correct reports by 1. Increment total reports count by 1."
                // Wait, if it was already incremented in create, I should check.
                // Let's assume totalReports = correct + false + pending. 
                // User's formula: (correct / total) * 100.
                
                // We'll follow the user's instructions:
                reporter.totalReports = (reporter.totalReports || 0) + 1;
                reporter.confidenceScore = ((reporter.correctReports || 0) / reporter.totalReports) * 100;
                
                await reporter.save();
            }
        }

        // 2. Handle Status Transitions (Organization Rewards)
        if (status) {
            const org = await User.findById(req.user._id);

            // Respond (Pending -> Monitoring)
            if (status === 'monitoring' && oldStatus === 'pending') {
                report.status = 'monitoring';
                report.org_id = req.user.userId || req.user._id.toString();
                
                if (org && org.role === 'org') {
                    org.respondedReports = (org.respondedReports || 0) + 1;
                    org.coins = (org.coins || 0) + 5;
                    await org.save();
                }
            } 
            // Resolve (Monitoring -> Cleared)
            else if (status === 'cleared' && oldStatus === 'monitoring') {
                // Constraint: Only the organization assigned to the incident can clear it
                if (report.org_id !== (req.user.userId || req.user._id.toString())) {
                    return res.status(403).json({ message: 'Unauthorized: This incident is assigned to another organization.' });
                }

                report.status = 'cleared';
                
                if (org && org.role === 'org') {
                    org.clearedReports = (org.clearedReports || 0) + 1;
                    org.coins = (org.coins || 0) + 10;
                    await org.save();
                }
            } else {
                report.status = status;
            }
        }

        await report.save();

        // Emit socket event to all clients to sync state
        // Re-populate for consistency before emitting
        const updatedReport = await Report.findById(report._id).populate('user', 'userId confidenceScore');
        req.io.emit('reportStatusUpdate', updatedReport);

        res.json(updatedReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReport, getReports, updateReportStatus };
