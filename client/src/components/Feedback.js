import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { postServerData } from '../helper/helper';

export default function Feedback() {
    const { 
        questions: { queue, answers },
        result: { result, username, email, regNo, department, departmentId }
    } = useSelector(state => state);

    const storeResult = async () => {
        try {
            // Calculate points
            let correctCount = 0;
            let attemptedCount = 0;

            // Log the complete state for debugging
            console.log("Complete state:", {
                answers,
                userAnswers: result,
                queue: queue.length
            });

            // Compare answers
            result.forEach((userAnswer, index) => {
                if (userAnswer !== undefined) {
                    attemptedCount++;
                    const isCorrect = Number(userAnswer) === Number(answers[index]);
                    
                    console.log(`Question ${index + 1}:`, {
                        userAnswer,
                        correctAnswer: answers[index],
                        isCorrect
                    });

                    if (isCorrect) {
                        correctCount++;
                    }
                }
            });

            console.log("Final calculation:", {
                attemptedQuestions: attemptedCount,
                correctAnswers: correctCount,
                totalQuestions: queue.length
            });

            const resultData = {
                username,
                email,
                regNo,
                department,
                departmentId,
                result,
                attempts: attemptedCount,
                points: correctCount,
                totalQuestions: queue.length
            };

            console.log("Submitting result with regNo:", resultData);

            const response = await postServerData(
                `${process.env.REACT_APP_SERVER_HOSTNAME}/api/result`,
                resultData
            );
            
            console.log("Server response:", response);
            return response;
        } catch (error) {
            console.error("Error storing result:", error);
            throw error;
        }
    };

    useEffect(() => {
        if (result?.length && username && email) {
            storeResult()
                .then(res => console.log("Result stored successfully:", res))
                .catch(err => console.error("Failed to store result:", err));
        }
    }, []);

    return (
        <div className='container'>
            <h2 className='title text-light'>Quiz Completed!</h2>
            {/* Add more UI elements as needed */}
        </div>
    );
}
