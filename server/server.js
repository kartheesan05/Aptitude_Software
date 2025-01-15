import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import router from './routes/route.js';
import morgan from 'morgan';
import { router as userRouter } from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import AccessCode from './models/accessCodeSchema.js';
import { router as questionRouter } from './routes/questionRoutes.js';
import { feedbackRouter } from './routes/feedbackRoutes.js';
import timerRoutes from './routes/timerRoutes.js';

// Load environment variables first
config();

const app = express();

/** Middlewares */
app.use(morgan('dev')); // Add logging
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api', questionRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/timer', timerRoutes);
app.use('/uploads', express.static('uploads'));

// Check if MongoDB URI exists
if (!process.env.MONGODB_URI && !process.env.ATLAS_URL) {
    console.error('MongoDB connection URI is not defined in .env file');
    process.exit(1);
}

// MongoDB connection with error handling
const mongoURI = process.env.MONGODB_URI || process.env.ATLAS_URL;
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Add this function
const initializeAccessCode = async () => {
    try {
        const existingCode = await AccessCode.findOne({ isActive: true });
        if (!existingCode) {
            await AccessCode.create({ 
                code: 'SVCE2024',  
                isActive: true 
            });
            console.log('Default access code created: SVCE2024');
        }
    } catch (error) {
        console.error('Error initializing access code:', error);
    }
};

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Database Connected");
        initializeAccessCode();
    })
    .catch(error => console.log(error));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

