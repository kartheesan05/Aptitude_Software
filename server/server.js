import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import router from './routes/route.js';

// Load environment variables first
config();

// Check if MongoDB URI exists
if (!process.env.ATLAS_URL) {
    console.error('ATLAS_URL is not defined in .env file');
    process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);

// MongoDB connection with error handling
mongoose.connect(process.env.ATLAS_URL)
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

