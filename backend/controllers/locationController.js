const User = require('../models/User');

const updateLocation = async (req, res) => {
    const { longitude, latitude } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            };
            await user.save();

            res.json({
                message: 'Location updated',
                location: user.location,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHeatmapData = async (req, res) => {
    // Heatmap data removed as requested
    res.json([]);
};

module.exports = { updateLocation, getHeatmapData };
