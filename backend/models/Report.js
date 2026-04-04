const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
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
    imageUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

reportSchema.index({ location: '2dsphere' });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
