const mongoose = require('mongoose');

const crowdDataSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    density: {
        type: Number, // 0 to 1 representing density
        default: 0,
    },
    type: {
        type: String,
        enum: ['normal', 'suspicious'],
        default: 'normal',
    },
}, {
    timestamps: true,
});

crowdDataSchema.index({ location: '2dsphere' });

const CrowdData = mongoose.model('CrowdData', crowdDataSchema);
module.exports = CrowdData;
