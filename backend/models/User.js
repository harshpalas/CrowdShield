const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['citizen', 'org'],
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
        },
    },
    documentId: {
        type: String,
        unique: true,
        sparse: true,
    },
    coins: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    discriminatorKey: 'role'
});

// GeoJSON index for location-based queries
userSchema.index({ location: '2dsphere' });

// Hash password and Generate Custom ID before saving
userSchema.pre('save', async function () {
    try {
        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }

        if (this.isNew) {
            // Generate Global Document ID
            const docSeq = await Counter.getNextSequenceValue('documents');
            this.documentId = `DOC${String(docSeq).padStart(3, '0')}`;

            // Generate Role-based User ID
            const roleField = this.role === 'citizen' ? 'citizens' : 'organisations';
            const roleSeq = await Counter.getNextSequenceValue(roleField);

            if (this.role === 'citizen') {
                this.userId = `CTZ${String(roleSeq).padStart(3, '0')}`;
            } else if (this.role === 'org') {
                const orgIdStr = `ORG${String(roleSeq).padStart(3, '0')}`;
                this.userId = orgIdStr;
                this.organizationId = orgIdStr;
            }
        }
    } catch (err) {
        throw err;
    }
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Citizen Discriminator
const Citizen = User.discriminator('citizen', new mongoose.Schema({
    userId: { type: String, unique: true, sparse: true },
    fullName: { type: String },
    familyMembers: [{ name: String, mobile: String }],
    confidenceScore: { type: Number, default: 0 },
    correctReports: { type: Number, default: 0 },
    falseReports: { type: Number, default: 0 },
    badges: { type: String, enum: ['newbie', 'knight', 'pro', 'true citizen'], default: 'newbie' },
    totalReports: { type: Number, default: 0 },
}));

// Organization Discriminator
const Organization = User.discriminator('org', new mongoose.Schema({
    organizationId: { type: String, unique: true, sparse: true },
    userId: { type: String, unique: true, sparse: true },
    organizationType: { type: String, enum: ['police station', 'NGO', 'rescue team'] },
    city: { type: String },
    respondedReports: { type: Number, default: 0 },
    clearedReports: { type: Number, default: 0 },
}));

module.exports = User;
