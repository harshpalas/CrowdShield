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
    image_url: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['normal', 'dangerous'],
        default: 'normal',
    },
    status: {
        type: String,
        enum: ['pending', 'monitoring', 'cleared'],
        default: 'pending',
    },
    ctz_id: {
        type: String, // e.g. CTZ01
        required: true,
    },
    ord_id: {
        type: String, // e.g. ORG01 when assigned
        default: null,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

reportSchema.index({ location: '2dsphere' });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
