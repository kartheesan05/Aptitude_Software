import R2, { BUCKET_NAME, PUBLIC_URL } from '../config/r2.js';
import path from 'path';
import crypto from 'crypto';

export const uploadImageToR2 = async (file) => {
    try {
        if (!file || !BUCKET_NAME) {
            return null;
        }

        // Generate random ID and keep file extension
        const randomId = crypto.randomBytes(16).toString('hex');
        const fileExtension = path.extname(file.originalname);
        const key = `${randomId}${fileExtension}`;


        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype || 'image/jpeg'
        };

        // Upload using AWS SDK v2 style
        const uploadedData = await R2.upload(uploadParams).promise();

        const imageUrl = `${PUBLIC_URL}/${key}`;
        
        return imageUrl;
    } catch (error) {
        console.error('Error uploading to R2:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            requestId: error.requestId
        });
        throw error;
    }
}; 