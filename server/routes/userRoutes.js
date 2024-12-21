import express from 'express';
import Result from '../models/resultSchema.js';
import AccessCode from '../models/accessCodeSchema.js';
const router = express.Router();

// Search user by email only
router.get('/search', async (req, res) => {
    try {
        const { email } = req.query;
        
        console.log("\n=== Search Request ===");
        console.log("Email:", email);

        if (!email) {
            return res.status(400).json({ 
                message: 'Email is required'
            });
        }

        // Find user by email
        const user = await Result.findOne({ email: email.trim() });

        if (!user) {
            return res.status(404).json({ 
                message: `No user found with email: ${email}`
            });
        }

        // Send back user data
        const userData = {
            name: user.username,
            email: user.email,
            regNo: user.regNo,  // Keep regNo in response
            department: user.dept,
            status: user.attempts > 0 ? 'completed' : 'not_started',
            score: user.points ? `${user.points}` : '0',
            totalQuestions: 50
        };

        console.log("\nSending user data:", userData);
        res.json(userData);

    } catch (error) {
        console.error("\nSearch error:", error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});

router.post('/verify-user', async (req, res) => {
    try {
        const { email, regNo } = req.body;

        // Check if user already exists
        const existingUser = await Result.findOne({
            $or: [
                { email: email },
                { regNo: regNo }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'A user with this email or registration number has already taken the test'
            });
        }

        res.json({ message: 'User can take the test' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/reset-test', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log("Received reset request for email:", email);

        if (!email) {
            return res.status(400).json({ 
                message: 'Email is required'
            });
        }

        // Find and delete the user from results collection
        const deletedUser = await Result.findOneAndDelete({ email: email });

        if (!deletedUser) {
            return res.status(404).json({ 
                message: 'User not found'
            });
        }

        console.log("User deleted successfully:", deletedUser);

        res.json({ 
            message: 'Test reset successfully',
            status: 'success'
        });
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
});

// Add this new route for checking if user has already taken the test
router.post('/check-user', async (req, res) => {
    try {
        const { email, regNo } = req.body;
        
        console.log("Checking user:", { email, regNo });

        if (!email || !regNo) {
            return res.status(400).json({ 
                message: 'Both email and registration number are required'
            });
        }

        // Check if user exists with either email or regNo
        const existingUser = await Result.findOne({
            $or: [
                { email: email },
                { regNo: regNo }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'You have already taken the test. Each user can only take the test once.',
                alreadyTaken: true
            });
        }

        res.json({ 
            message: 'User can proceed with the test',
            canTakeTest: true
        });

    } catch (error) {
        console.error('User check error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
});

router.post('/verify-code', async (req, res) => {
    try {
        const { accessCode } = req.body;
        const validCode = await AccessCode.findOne({ 
            code: accessCode,
            isActive: true 
        });

        res.json({ valid: !!validCode });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/current-code', async (req, res) => {
    try {
        const currentCode = await AccessCode.findOne({ isActive: true });
        res.json({ code: currentCode?.code || 'No active code' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/update-code', async (req, res) => {
    try {
        const { code } = req.body;
        
        // Deactivate current code
        await AccessCode.updateMany({}, { isActive: false });
        
        // Create new code
        await AccessCode.create({ code, isActive: true });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add this new route for initializing a default code
router.post('/admin/init-code', async (req, res) => {
    try {
        // Check if any active code exists
        const existingCode = await AccessCode.findOne({ isActive: true });
        
        if (!existingCode) {
            // Create default code if none exists
            await AccessCode.create({ 
                code: 'SVCE2024',  // Default code
                isActive: true 
            });
            res.json({ message: 'Default access code created: SVCE2024' });
        } else {
            res.json({ message: 'Access code already exists', code: existingCode.code });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export { router };
