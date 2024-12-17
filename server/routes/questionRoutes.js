import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

// Question Schema
const questionSchema = new mongoose.Schema({
  category: String,
  subCategory: String,
  question: String,
  options: [String],
  correctAnswer: Number,
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

export { router };
