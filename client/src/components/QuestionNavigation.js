import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTraceAction } from '../redux/question_reducer';
import '../styles/QuestionNavigation.css';

export default function QuestionNavigation() {
    const dispatch = useDispatch();
    const { trace, queue, categories } = useSelector(state => state.questions);
    const result = useSelector(state => state.result.result);

    // Return null if no questions are loaded
    if (!queue || !Array.isArray(queue) || queue.length === 0) {
        return null;
    }

    const getCategoryQuestions = (category) => {
        const { start, end } = categories[category];
        return queue.slice(start, end + 1);
    };

    const getCategoryStatus = (category) => {
        const { start, end } = categories[category];
        const total = end - start + 1;
        const answered = result
            .slice(start, end + 1)
            .filter(r => r !== undefined)
            .length;
        return { total, answered };
    };

    const navigateToQuestion = (index) => {
        dispatch(setTraceAction(index));
    };

    const getQuestionStatus = (index) => {
        if (result[index] !== undefined) return 'answered';
        if (index === trace) return 'current';
        return 'unanswered';
    };

    const categoryData = {
        aptitude: { 
            name: 'Aptitude', 
            start: categories.aptitude.start, 
            end: categories.aptitude.end 
        },
        core: { 
            name: 'Core', 
            start: categories.core.start, 
            end: categories.core.end 
        },
        verbal: { 
            name: 'Verbal', 
            start: categories.verbal.start, 
            end: categories.verbal.end 
        },
        programming: { 
            name: 'Programming', 
            start: categories.programming.start, 
            end: categories.programming.end 
        }
    };

    return (
        <div className="question-navigation">
            {Object.entries(categoryData).map(([category, { name, start, end }]) => {
                const status = getCategoryStatus(category);
                return (
                    <div key={category} className="category-section">
                        <div className="category-header">
                            <h3>{name}</h3>
                            <span className="question-count">
                                {status.answered}/{status.total}
                            </span>
                        </div>
                        <div className="question-grid">
                            {Array.from({ length: end - start + 1 }, (_, i) => {
                                const questionIndex = start + i;
                                return (
                                    <button
                                        key={questionIndex}
                                        className={`question-button ${getQuestionStatus(questionIndex)}`}
                                        onClick={() => navigateToQuestion(questionIndex)}
                                    >
                                        {questionIndex + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
