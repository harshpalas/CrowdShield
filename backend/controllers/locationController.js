const User = require('../models/User');
const CrowdData = require('../models/CrowdData');
const Alert = require('../models/Alert');

const updateLocation = async (req, res) => {
    const { longitude, latitude } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };
            await user.save();

            // Check if user is in a high-density zone
            const nearbyCrowds = await CrowdData.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude],
                        },
                        $maxDistance: 200, // 200 meters
                    },
                },
                density: { $gt: 0.7 }, // High density
            });

            const isInCrowdedZone = nearbyCrowds.length > 0;

            res.json({
                message: 'Location updated',
                isInCrowdedZone,
                nearbyCrowds,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHeatmapData = async (req, res) => {
    try {
        const heatmap = await CrowdData.find({});
        res.json(heatmap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { updateLocation, getHeatmapData };
