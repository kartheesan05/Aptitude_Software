import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import '../styles/Instructions.css';

export default function Instructions() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { username } = useSelector(state => state.result);

    useEffect(() => {
        if(!username) {
            navigate('/');
            return;
        }
        // Clear any existing quiz state when starting new quiz
        sessionStorage.removeItem('quizState');
    }, []);

    useEffect(() => {
        const preventBackButton = (e) => {
            e.preventDefault();
            e.returnValue = '';
            alert("Please use the provided buttons to navigate. Don't use browser navigation.");
        };

        const preventBackNavigation = () => {
            alert("Please use the provided buttons to navigate. Don't use browser navigation.");
            navigate('/instructions', { replace: true });
        };

        window.addEventListener('beforeunload', preventBackButton);
        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', preventBackNavigation);

        return () => {
            window.removeEventListener('beforeunload', preventBackButton);
            window.removeEventListener('popstate', preventBackNavigation);
        };
    }, [navigate]);

    const startQuiz = () => {
        if(!username){
            navigate('/');
            return;
        }
        // Reset trace before starting quiz
        dispatch({ type: 'SET_TRACE', payload: 0 });
        navigate('/quiz');
    }

    return (
        <div className='container'>
            <h1 className='title'>Instructions</h1>
            
            <div className='instructions'>
                <h2>Please read the following instructions carefully:</h2>
                <ul>
                    <li>The quiz contains multiple choice questions.</li>
                    <li>Each question has only one correct answer.</li>
                    <li>You cannot go back to previous questions once answered.</li>
                    <li>Each correct answer will earn you points.</li>
                    <li>There is no negative marking.</li>
                    <li>Do not refresh the page during the quiz.</li>
                </ul>
            </div>

            <div className='btn-container'>
                <button onClick={startQuiz} className='btn'>
                    Start Quiz
                </button>
            </div>
        </div>
    );
}
