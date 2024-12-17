import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/Instructions.css';

export default function Instructions() {
    const navigate = useNavigate();
    const { username } = useSelector(state => state.result);

    const startQuiz = () => {
        if(!username){
            navigate('/');
            return;
        }
        navigate('/quiz');
    }

    return (
        <div className='container'>
            <h1 className='title text-light'>Instructions</h1>
            
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
