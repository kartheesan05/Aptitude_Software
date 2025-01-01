import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Question Schema
const questionSchema = new mongoose.Schema({
  category: String,
  subCategory: String,
  question: String,
  options: [String],
  correctAnswer: Number,
  image: String,
  createdAt: { type: Date, default: Date.now }
});

// Models
const AptitudeQuestion = mongoose.model('AptitudeQuestion', questionSchema);
const CoreQuestion = mongoose.model('CoreQuestion', questionSchema);
const VerbalQuestion = mongoose.model('VerbalQuestion', questionSchema);
const ProgrammingQuestion = mongoose.model('ProgrammingQuestion', questionSchema);

// Route to get all questions
router.get('/all', async (req, res) => {
  try {
    console.log('Fetching all questions...'); // Debug log

    const aptitudeQuestions = await AptitudeQuestion.find().lean();
    const coreQuestions = await CoreQuestion.find().lean();
    const verbalQuestions = await VerbalQuestion.find().lean();
    const programmingQuestions = await ProgrammingQuestion.find().lean();

    const allQuestions = [
      ...aptitudeQuestions,
      ...coreQuestions,
      ...verbalQuestions,
      ...programmingQuestions
    ];

    const answers = allQuestions.map(q => q.correctAnswer);

    console.log(`Found ${allQuestions.length} questions`); // Debug log

    res.json([{
      questions: allQuestions,
      answers: answers
    }]);

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ 
      error: 'Error fetching questions',
      details: error.message 
    });
  }
});

// Add question route
router.post('/add', async (req, res) => {
  try {
    console.log('Received request body:', req.body); // Debug log

    const { category, subCategory, question, options, correctAnswer } = req.body;

    // Validate inputs
    if (!category) {
      throw new Error('Category is required');
    }
    if (!subCategory) {
      throw new Error('Sub-category is required');
    }
    if (!question) {
      throw new Error('Question is required');
    }
    if (!Array.isArray(options) || options.length !== 4) {
      throw new Error('Four options are required');
    }
    if (correctAnswer === undefined || correctAnswer === '') {
      throw new Error('Correct answer is required');
    }

    // Select the appropriate model based on category
    let QuestionModel;
    switch (category) {
      case 'aptitude':
        QuestionModel = AptitudeQuestion;
        break;
      case 'core':
        QuestionModel = CoreQuestion;
        break;
      case 'verbal':
        QuestionModel = VerbalQuestion;
        break;
      case 'programming':
        QuestionModel = ProgrammingQuestion;
        break;
      default:
        throw new Error(`Invalid category: ${category}`);
    }

    console.log('Selected model:', QuestionModel.modelName); // Debug log

    const newQuestion = new QuestionModel({
      category,
      subCategory,
      question,
      options,
      correctAnswer: Number(correctAnswer)
    });

    console.log('Created question object:', newQuestion); // Debug log

    const savedQuestion = await newQuestion.save();
    console.log('Saved question:', savedQuestion); // Debug log

    res.status(201).json({ 
      message: 'Question added successfully',
      question: savedQuestion 
    });
  } catch (error) {
    console.error('Detailed error:', error); // Debug log
    res.status(500).json({ 
      message: 'Error adding question',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add this at the top of your routes
router.get('/test', (req, res) => {
    res.json({ message: 'Question routes working' });
});

// Add department-specific route
router.get('/:departmentId', async (req, res) => {
    try {
        const { departmentId } = req.params;
        console.log('Fetching questions for department:', departmentId); // Debug log

        // Get questions based on department
        const aptitudeQuestions = await AptitudeQuestion.find().lean().limit(10);
        const verbalQuestions = await VerbalQuestion.find().lean().limit(5);
        const programmingQuestions = await ProgrammingQuestion.find().lean().limit(5);
        
        // Get core questions specific to department
        const coreQuestions = await CoreQuestion.find({ 
            subCategory: departmentId 
        }).lean().limit(10);

        const allQuestions = [
            ...aptitudeQuestions,
            ...coreQuestions,
            ...verbalQuestions,
            ...programmingQuestions
        ];

        const answers = allQuestions.map(q => q.correctAnswer);

        console.log(`Found ${allQuestions.length} questions for ${departmentId}`);

        res.json([{
            questions: allQuestions,
            answers: answers
        }]);

    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ 
            error: 'Error fetching questions',
            details: error.message 
        });
    }
});

// Routes for different question types
router.post('/aptitude-questions', upload.single('image'), async (req, res) => {
    try {
        const { question, options, correctAnswer, category } = req.body;
        
        const newQuestion = new AptitudeQuestion({
            category: 'aptitude',
            subCategory: category,
            question,
            options,
            correctAnswer,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        await newQuestion.save();
        res.status(201).json({ message: 'Question added successfully' });
    } catch (error) {
        console.error('Error adding aptitude question:', error);
        res.status(500).json({ message: 'Error adding question' });
    }
});

router.post('/verbal-questions', upload.single('image'), async (req, res) => {
    try {
        // Debug logs
        console.log('Received verbal question data:', req.body);
        
        const { question, category } = req.body;
        
        // Extract options from form data
        const options = [];
        // Look for options in both formats
        for (let i = 0; i < 4; i++) {
            const option = req.body[`options[${i}]`] || req.body.options?.[i];
            if (option) {
                options.push(option);
            }
        }

        console.log('Extracted options:', options);

        // Validate the data
        if (!question) throw new Error('Question is required');
        if (!category) throw new Error('Category is required');
        if (options.length !== 4) {
            console.error('Options received:', options);
            throw new Error('Four options are required');
        }

        const newQuestion = new VerbalQuestion({
            category: 'verbal',
            subCategory: category,
            question,
            options: options,
            correctAnswer: Number(req.body.correctAnswer),
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        console.log('Question to be saved:', {
            category: 'verbal',
            subCategory: category,
            question,
            options,
            correctAnswer: Number(req.body.correctAnswer)
        });

        const savedQuestion = await newQuestion.save();
        
        res.status(201).json({ 
            message: 'Question added successfully',
            question: savedQuestion
        });
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            body: req.body,
            options: req.body.options
        });
        res.status(500).json({ 
            message: 'Error adding question', 
            error: error.message,
            requestData: {
                body: req.body,
                options: req.body.options
            }
        });
    }
});

router.post('/programming-questions', upload.single('image'), async (req, res) => {
    try {
        // Debug logs
        console.log('Received programming question data:', req.body);
        
        const { question, category } = req.body;
        
        // Extract options from form data
        const options = [];
        // Look for options in both formats
        for (let i = 0; i < 4; i++) {
            const option = req.body[`options[${i}]`] || req.body.options?.[i];
            if (option) {
                options.push(option);
            }
        }

        console.log('Extracted options:', options);

        // Validate the data
        if (!question) throw new Error('Question is required');
        if (!category) throw new Error('Category is required');
        if (options.length !== 4) {
            console.error('Options received:', options);
            throw new Error('Four options are required');
        }

        const newQuestion = new ProgrammingQuestion({
            category: 'programming',
            subCategory: category,
            question,
            options: options,
            correctAnswer: Number(req.body.correctAnswer),
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        console.log('Question to be saved:', {
            category: 'programming',
            subCategory: category,
            question,
            options,
            correctAnswer: Number(req.body.correctAnswer)
        });

        const savedQuestion = await newQuestion.save();
        
        res.status(201).json({ 
            message: 'Question added successfully',
            question: savedQuestion
        });
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            body: req.body,
            options: req.body.options
        });
        res.status(500).json({ 
            message: 'Error adding question', 
            error: error.message,
            requestData: {
                body: req.body,
                options: req.body.options
            }
        });
    }
});

router.post('/core-questions', upload.single('image'), async (req, res) => {
    try {
        // Debug logs
        console.log('Received core question data:', req.body);
        
        const { question, category } = req.body;
        
        // Extract options from form data
        const options = [];
        // Look for options in both formats
        for (let i = 0; i < 4; i++) {
            const option = req.body[`options[${i}]`] || req.body.options?.[i];
            if (option) {
                options.push(option);
            }
        }

        console.log('Extracted options:', options);

        // Validate the data
        if (!question) throw new Error('Question is required');
        if (!category) throw new Error('Category is required');
        if (options.length !== 4) {
            console.error('Options received:', options);
            throw new Error('Four options are required');
        }

        const newQuestion = new CoreQuestion({
            category: 'core',
            subCategory: category,
            question,
            options: options,
            correctAnswer: Number(req.body.correctAnswer),
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        console.log('Question to be saved:', {
            category: 'core',
            subCategory: category,
            question,
            options,
            correctAnswer: Number(req.body.correctAnswer)
        });

        const savedQuestion = await newQuestion.save();
        
        res.status(201).json({ 
            message: 'Question added successfully',
            question: savedQuestion
        });
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            body: req.body,
            options: req.body.options
        });
        res.status(500).json({ 
            message: 'Error adding question', 
            error: error.message,
            requestData: {
                body: req.body,
                options: req.body.options
            }
        });
    }
});

// Add this test route to check questions with images
router.get('/test-images', async (req, res) => {
    try {
        // Get one question with image from each collection
        const aptitudeQuestion = await AptitudeQuestion.findOne({ image: { $ne: null } }).lean();
        const coreQuestion = await CoreQuestion.findOne({ image: { $ne: null } }).lean();
        const verbalQuestion = await VerbalQuestion.findOne({ image: { $ne: null } }).lean();
        const programmingQuestion = await ProgrammingQuestion.findOne({ image: { $ne: null } }).lean();

        const questionsWithImages = {
            aptitude: aptitudeQuestion,
            core: coreQuestion,
            verbal: verbalQuestion,
            programming: programmingQuestion
        };

        // Log for debugging
        console.log('Questions with images found:', 
            Object.entries(questionsWithImages)
                .map(([type, q]) => `${type}: ${q ? 'Has image' : 'No image'}`)
        );

        res.json(questionsWithImages);
    } catch (error) {
        console.error('Error testing images:', error);
        res.status(500).json({ error: 'Error testing images' });
    }
});

export { router };
