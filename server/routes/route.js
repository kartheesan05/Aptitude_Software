import { Router } from "express";
import Result from '../models/resultSchema.js';
import mongoose from 'mongoose';
const router = Router();

// Define models for existing collections
const AptitudeQuestion = mongoose.model('aptitudequestions', new mongoose.Schema({}, { strict: false }));
const CoreQuestion = mongoose.model('corequestions', new mongoose.Schema({}, { strict: false }));
const VerbalQuestion = mongoose.model('verbalquestions', new mongoose.Schema({}, { strict: false }));
const ProgrammingQuestion = mongoose.model('programmingquestions', new mongoose.Schema({}, { strict: false }));

const departmentCoreMapping = {
  'cs': 'cs',
  'it': 'it',
  'ec': 'ec',
  'ee': 'ee',
  'mech': 'mech',
  'civil': 'civil',
  'chem': 'chem',
  'bio': 'bio',
  'aids': 'aids',
  'auto': 'auto',
  'marine': 'marine'
};

// Add this debug route after your imports and before other routes
router.get('/debug', async (req, res) => {
    try {
        const counts = await Promise.all([
            AptitudeQuestion.countDocuments(),
            CoreQuestion.countDocuments(),
            VerbalQuestion.countDocuments(),
            ProgrammingQuestion.countDocuments()
        ]);

        res.json({
            aptitudeCount: counts[0],
            coreCount: counts[1],
            verbalCount: counts[2],
            programmingCount: counts[3]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/** Questions Routes API */
router.get('/questions', async (req, res) => {
    try {
        // Get 2 random questions from each category
        const aptitudeQuestions = await AptitudeQuestion.aggregate([{ $sample: { size: 2 } }]);
        const coreQuestions = await CoreQuestion.aggregate([{ $sample: { size: 2 } }]);
        const verbalQuestions = await VerbalQuestion.aggregate([{ $sample: { size: 2 } }]);
        const programmingQuestions = await ProgrammingQuestion.aggregate([{ $sample: { size: 2 } }]);

        // Combine all questions
        let allQuestions = [
            ...aptitudeQuestions.map(q => ({ ...q, category: 'aptitude' })),
            ...coreQuestions.map(q => ({ ...q, category: 'core' })),
            ...verbalQuestions.map(q => ({ ...q, category: 'verbal' })),
            ...programmingQuestions.map(q => ({ ...q, category: 'programming' }))
        ];

        // Shuffle the combined array
        allQuestions = allQuestions.sort(() => Math.random() - 0.5);

        // Create answers array
        const answers = allQuestions.map(q => q.correctAnswer);

        res.json([{
            questions: allQuestions,
            answers: answers
        }]);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/questions/:deptId', async (req, res) => {
    try {
        const { deptId } = req.params;
        console.log("Fetching questions for department:", deptId);
        
        // Get random questions with updated counts
        const aptitudeQuestions = await AptitudeQuestion.aggregate([
            { $sample: { size: 15 } }  // 15 aptitude questions
        ]);

        const coreQuestions = await CoreQuestion.aggregate([
            { 
                $match: { category: deptId }
            },
            { $sample: { size: 15 } }  // 15 core questions
        ]);

        const verbalQuestions = await VerbalQuestion.aggregate([
            { $sample: { size: 10 } }  // 10 verbal questions
        ]);

        const programmingQuestions = await ProgrammingQuestion.aggregate([
            { $sample: { size: 10 } }  // 10 programming questions
        ]);

        console.log("Questions fetched:", {
            aptitude: aptitudeQuestions.length,
            core: coreQuestions.length,
            verbal: verbalQuestions.length,
            programming: programmingQuestions.length
        });

        // Combine all questions
        let allQuestions = [
            ...aptitudeQuestions.map(q => ({ ...q, category: 'aptitude' })),
            ...coreQuestions.map(q => ({ ...q, category: 'core' })),
            ...verbalQuestions.map(q => ({ ...q, category: 'verbal' })),
            ...programmingQuestions.map(q => ({ ...q, category: 'programming' }))
        ];

        // Shuffle the combined array
        allQuestions = allQuestions.sort(() => Math.random() - 0.5);

        // Create answers array
        const answers = allQuestions.map(q => q.correctAnswer);

        res.json([{
            questions: allQuestions,
            answers: answers
        }]);

    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: error.message });
    }
});

/** Result Routes API */
router.get('/result', async (req, res) => {
    try {
        const results = await Result.find();
        res.json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/result', async (req, res) => {
    try {
        const { 
            username, 
            email, 
            regNo,
            department, 
            result, 
            attempts, 
            points,
            totalQuestions 
        } = req.body;

        const newResult = new Result({
            username,
            email,
            regNo,
            dept: department,
            result,
            attempts,
            points,
            totalQuestions
        });

        const savedResult = await newResult.save();
        res.json(savedResult);

    } catch (error) {
        console.error('Error saving result:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/result', async (req, res) => {
    try {
        await Result.deleteMany({});
        res.json({ message: "All results deleted successfully" });
    } catch (error) {
        console.error('Error deleting results:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add this with your other routes
// router.get('/users/search', async (req, res) => {
//     try {
//         const { regNo } = req.query;
        
//         if (!regNo) {
//             return res.status(400).json({ message: 'Registration number is required' });
//         }

//         const user = await Result.findOne({ regNo });
        
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const userData = {
//             name: user.username,
//             email: user.email,
//             regNo: user.regNo,
//             department: user.dept,
//             status: user.attempts > 0 ? 'completed' : 'not_started',
//             score: `${user.points} out of ${user.totalQuestions}`,  // Updated score format
//             totalQuestions: user.totalQuestions
//         };

//         res.json(userData);

//     } catch (error) {
//         console.error('Error searching user:', error);
//         res.status(500).json({ message: 'Error searching for user' });
//     }
// });

// Add this route to search user by email
router.get('/users/search', async (req, res) => {
    try {
        const { email } = req.query; 
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' }); 
        }

        const user = await Result.findOne({ email }); 
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            name: user.username,
            email: user.email,
            regNo: user.regNo,
            department: user.dept,
            status: user.attempts > 0 ? 'completed' : 'not_started',
            score: `${user.points} `, 
            totalQuestions: user.totalQuestions
        };

        res.json(userData);

    } catch (error) {
        console.error('Error searching user:', error);
        res.status(500).json({ message: 'Error searching for user' });
    }
});


// Reset test endpoint - modified to delete the record
router.post('/users/reset-test', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Delete the user's result completely from database
        const result = await Result.findOneAndDelete({ email });

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Test reset successfully. Result deleted from database.' });

    } catch (error) {
        console.error('Error resetting test:', error);
        res.status(500).json({ message: 'Error resetting test' });
    }
});

// Add check before starting quiz
router.post('/check-attempt', async (req, res) => {
    try {
        const { regNo } = req.body;
        const user = await Result.findOne({ regNo });
        
        if (user && user.attempts > 0) {
            return res.status(403).json({ 
                message: 'You have already taken the test. Please contact admin for reset.' 
            });
        }
        
        res.json({ canTakeTest: true });
    } catch (error) {
        res.status(500).json({ message: 'Error checking test attempt' });
    }
});

export default router;