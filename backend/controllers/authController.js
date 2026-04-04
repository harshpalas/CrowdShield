const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

const registerUser = async (req, res) => {
    const { role, email } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.warn(`Registration Attempt: User already exists (${email})`);
            return res.status(400).json({ message: 'User already exists' });
        }

        let newUser;
        if (role === 'citizen') {
            const { fullName, password, phone, location, familyMembers } = req.body;
            newUser = {
                role,
                fullName,
                email,
                password,
                phone,
                location,
                familyMembers,
            };
        } else if (role === 'org') {
            const { organizationType, city, location, phone, password } = req.body;
            newUser = {
                role,
                organizationType,
                city,
                location,
                email,
                phone,
                password,
            };
        } else {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        const user = await User.create(newUser);

        if (user) {
            const token = generateToken(user._id);
            console.log(`Registration Success: ${email} as ${role}`);
            
            // Return full user data as requested
            res.status(201).json({
                _id: user._id,
                role: user.role,
                email: user.email,
                phone: user.phone,
                location: user.location,
                documentId: user.documentId,
                coins: user.coins,
                token,
                ...(user.role === 'citizen' && {
                    userId: user.userId,
                    fullName: user.fullName,
                    familyMembers: user.familyMembers,
                    confidenceScore: user.confidenceScore,
                    correctReports: user.correctReports,
                    falseReports: user.falseReports,
                    badges: user.badges,
                    totalReports: user.totalReports,
                }),
                ...(user.role === 'org' && {
                    userId: user.userId, // Same as organizationId but requested as userId
                    organizationId: user.organizationId,
                    organizationType: user.organizationType,
                    city: user.city,
                    respondedReports: user.respondedReports,
                    clearedReports: user.clearedReports,
                }),
            });
        }
    } catch (error) {
        console.error('CRITICAL Registration Error Stack:', error);
        res.status(500).json({ message: error.message || 'Server Error during registration' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id);
            console.log(`Login Success: ${email}`);
            
            res.json({
                _id: user._id,
                role: user.role,
                email: user.email,
                phone: user.phone,
                location: user.location,
                documentId: user.documentId,
                coins: user.coins,
                token,
                ...(user.role === 'citizen' && {
                    userId: user.userId,
                    fullName: user.fullName,
                    familyMembers: user.familyMembers,
                    confidenceScore: user.confidenceScore,
                    correctReports: user.correctReports,
                    falseReports: user.falseReports,
                    badges: user.badges,
                    totalReports: user.totalReports,
                }),
                ...(user.role === 'org' && {
                    userId: user.userId,
                    organizationId: user.organizationId,
                    organizationType: user.organizationType,
                    city: user.city,
                    respondedReports: user.respondedReports,
                    clearedReports: user.clearedReports,
                }),
            });
        } else {
            console.warn(`Login Failed: Invalid credentials for ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('CRITICAL Login Error Stack:', error);
        res.status(500).json({ message: error.message || 'Server Error during login' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { fullName, email, phone, location, familyMembers, organizationType, city, password } = req.body;

        // Basic Info
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (location) user.location = location;
        
        // Password update
        if (password) {
            user.password = password; // Pre-save hook will hash it
        }

        // Role-Specific Info
        if (user.role === 'citizen') {
            if (fullName) user.fullName = fullName;
            if (familyMembers) user.familyMembers = familyMembers;
        } else if (user.role === 'org') {
            if (organizationType) user.organizationType = organizationType;
            if (city) user.city = city;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            role: updatedUser.role,
            email: updatedUser.email,
            phone: updatedUser.phone,
            location: updatedUser.location,
            documentId: updatedUser.documentId,
            coins: updatedUser.coins,
            ...(updatedUser.role === 'citizen' && {
                userId: updatedUser.userId,
                fullName: updatedUser.fullName,
                familyMembers: updatedUser.familyMembers,
                confidenceScore: updatedUser.confidenceScore,
                correctReports: updatedUser.correctReports,
                falseReports: updatedUser.falseReports,
                badges: updatedUser.badges,
                totalReports: updatedUser.totalReports,
            }),
            ...(updatedUser.role === 'org' && {
                userId: updatedUser.userId,
                organizationId: updatedUser.organizationId,
                organizationType: updatedUser.organizationType,
                city: updatedUser.city,
                respondedReports: updatedUser.respondedReports,
                clearedReports: updatedUser.clearedReports,
            }),
        });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, updateProfile };
