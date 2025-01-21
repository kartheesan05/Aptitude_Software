import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    id: String,
    name: String,
    coreCategory: String,
    isActive: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('Department', departmentSchema); 