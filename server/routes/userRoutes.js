import express from 'express';
import Result from '../models/resultSchema.js';
import AccessCode from '../models/accessCodeSchema.js';
import ActiveSession from '../models/activeSession.js';
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

        // Check both Result and ActiveSession collections
        const completedUser = await Result.findOne({ email: email.trim() });
        const activeUser = await ActiveSession.findOne({ email: email.trim() });

        console.log("Search results:", {
            completedUser: !!completedUser,
            activeUser: !!activeUser
        });

        // If user not found in either collection
        if (!completedUser && !activeUser) {
            console.log("No user found in either collection");
            return res.status(404).json({ 
                message: `No user found with email: ${email}`
            });
        }

        // Prepare response data
        let userData = {
            email: email,
            status: completedUser ? 'completed' : (activeUser ? 'in_progress' : 'not_found')
        };

        // Add completed test data if available
        if (completedUser) {
            userData = {
                ...userData,
                name: completedUser.username,
                regNo: completedUser.regNo,
                department: completedUser.dept,
                score: completedUser.points ? `${completedUser.points}` : '0',
                totalQuestions: completedUser.totalQuestions || 50
            };
        }

        // Add active session data if available
        if (activeUser) {
            console.log("Active user found:", activeUser);
            userData = {
                ...userData,
                regNo: activeUser.regNo,
                startTime: activeUser.startTime,
                sessionExpiresAt: activeUser.expiresAt
            };
        }

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

// Check if user has an active session or has completed test
router.post('/check-session', async (req, res) => {
    try {
        const { email, regNo } = req.body;

        // First check if user has already completed the test
        const existingResult = await Result.findOne({ email, regNo });
        if (existingResult) {
            return res.json({ 
                canTakeTest: false, 
                hasActiveSession: false,
                message: 'User has already completed the test'
            });
        }

        // Then check for active session
        const activeSession = await ActiveSession.findOne({ email, regNo });
        if (activeSession) {
            return res.json({ 
                canTakeTest: true, 
                hasActiveSession: true,
                message: 'User has an active session'
            });
        }

        return res.json({ 
            canTakeTest: true, 
            hasActiveSession: false,
            message: 'User can take test'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new session when user starts test
router.post('/create-session', async (req, res) => {
    try {
        const { email, regNo } = req.body;
        
        const newSession = new ActiveSession({
            email,
            regNo,
            startTime: new Date()
        });

        await newSession.save();
        res.json({ message: 'Session created successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Clear session when test is completed
router.post('/clear-session', async (req, res) => {
    try {
        const { email, regNo } = req.body;
        
        await ActiveSession.findOneAndDelete({ email, regNo });
        res.json({ message: 'Session cleared successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check if user has an active session (admin route)
router.get('/check-active-session', async (req, res) => {
    try {
        const { email } = req.query;
        const activeSession = await ActiveSession.findOne({ email });
        
        res.json({ 
            hasActiveSession: !!activeSession,
            sessionDetails: activeSession
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin route to clear active session
router.post('/admin-clear-session', async (req, res) => {
    try {
        const { email } = req.body;
        await ActiveSession.findOneAndDelete({ email });
        
        res.json({ 
            message: 'Active session cleared successfully',
            status: 'success'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export { router };
