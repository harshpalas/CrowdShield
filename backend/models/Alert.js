const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    zoneId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CrowdData',
    },
    type: {
        type: String,
        enum: ['crowd', 'suspicious', 'family', 'general'],
        default: 'crowd',
    },
    level: {
        type: String,
        enum: ['low', 'medium', 'high', 'danger'],
        default: 'low',
    },
}, {
    timestamps: true,
});

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
