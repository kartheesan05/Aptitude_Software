import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postServerData } from '../helper/helper'
import axios from 'axios'

const StarRating = ({ rating, setRating, question }) => {
    return (
        <div className="star-rating">
            <p>{question}</p>
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <span
                        key={index}
                        className={`star ${starValue <= rating ? 'selected' : ''}`}
                        onClick={() => setRating(starValue)}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
};

export default function Feedback() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { 
        questions: { queue, answers },
        result: { result, username, email, regNo, department, departmentId }
    } = useSelector(state => state);

    const [feedbackData, setFeedbackData] = useState({
        q1: 0,
        q2: 0,
        q3: 0,
        comments: ''
    });

    const [resultStored, setResultStored] = useState(false);

    const questions = {
        q1: "How would you rate the difficulty level of the questions?",
        q2: "How would you rate the clarity of the questions?",
        q3: "How would you rate your overall experience?"
    };

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
            setResultStored(true);
            return response;
        } catch (error) {
            console.error("Error storing result:", error);
            throw error;
        }
    };

    const handleFeedbackSubmit = async () => {
        try {
            // Validation checks
            if (feedbackData.q1 === 0 || feedbackData.q2 === 0 || feedbackData.q3 === 0) {
                setError('Please rate all questions');
                return;
            }

            if (!feedbackData.comments.trim()) {
                setError('Please provide your comments');
                return;
            }

            setIsLoading(true); // Add loading state while submitting

            // Submit feedback
            await axios.post('http://localhost:5000/api/feedback', {
                username,
                email,
                regNo,
                department,
                ratings: {
                    q1: feedbackData.q1,
                    q2: feedbackData.q2,
                    q3: feedbackData.q3
                },
                comments: feedbackData.comments.trim()
            });

            // Remove event listeners before navigation
            window.removeEventListener('beforeunload', () => {});
            window.removeEventListener('popstate', () => {});

            // Navigate to success page after successful submission
            navigate('/success', { replace: true });

        } catch (error) {
            console.error('Feedback submission error:', error);
            setError(error.response?.data?.message || 'Error submitting feedback');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initializePage = async () => {
            setIsLoading(true);
            try {
                if (result?.length && username && email && !resultStored) {
                    await storeResult();
                }
                
                // Only check test status after result is stored
                if (resultStored) {
                    const response = await axios.get(`http://localhost:5000/api/users/check-test-status`, {
                        params: { email, regNo }
                    });

                    if (!response.data.hasCompletedTest) {
                        navigate('/', { replace: true });
                    }
                }
            } catch (error) {
                console.error('Initialization error:', error);
                setError('There was an error loading your feedback page. Please try refreshing.');
            } finally {
                setIsLoading(false);
            }
        };

        initializePage();
    }, [resultStored]);

    useEffect(() => {
        // Prevent leaving the page without submitting feedback
        const preventLeaving = (e) => {
            const message = "You haven't submitted your feedback yet. Your responses are important to us. Are you sure you want to leave?";
            e.preventDefault();
            e.returnValue = message;
            return message;
        };

        const preventBackNavigation = (e) => {
            e.preventDefault();
            alert("Please complete and submit your feedback before leaving. If you need to exit, use the submit button.");
            // Push a new entry to prevent leaving the feedback page
            window.history.pushState(null, null, window.location.pathname);
        };

        // Handle both browser back button and page refresh/close
        window.addEventListener('beforeunload', preventLeaving);
        
        // Handle browser back button specifically
        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', preventBackNavigation);

        // Cleanup function
        return () => {
            window.removeEventListener('beforeunload', preventLeaving);
            window.removeEventListener('popstate', preventBackNavigation);
        };
    }, [navigate, email, regNo]);

    if (isLoading) {
        return <div className='container'>
            <h2 className='title text-light'>Loading...</h2>
        </div>;
    }

    return (
        <div className='container'>
            <h2 className='title text-light'>Quiz Completed!</h2>
            
            <div className="feedback-section">
                {error && <div className="error-msg">{error}</div>}
                
                {Object.entries(questions).map(([key, question]) => (
                    <StarRating
                        key={key}
                        rating={feedbackData[key]}
                        setRating={(value) => setFeedbackData({...feedbackData, [key]: value})}
                        question={question}
                    />
                ))}

                <div className="comment-section">
                    <textarea
                        placeholder="Please share your additional comments..."
                        value={feedbackData.comments}
                        onChange={(e) => setFeedbackData({...feedbackData, comments: e.target.value})}
                        required
                        className="feedback-textarea"
                    />
                </div>

                <button 
                    onClick={handleFeedbackSubmit}
                    className="btn"
                >
                    Submit Feedback & Finish
                </button>
            </div>
        </div>
    );
}
