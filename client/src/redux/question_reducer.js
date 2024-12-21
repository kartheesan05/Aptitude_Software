export const questionReducer = (state = {
    queue: [],
    answers: [],
    trace: 0,
    userAnswers: []
}, action) => {
    switch (action.type) {
        case 'START_EXAM':
            return {
                ...state,
                queue: action.payload.question,
                answers: action.payload.answers,
                userAnswers: new Array(action.payload.question.length).fill(undefined)
            }
        case 'MOVE_NEXT':
            return {
                ...state,
                trace: state.trace + 1
            }
        case 'MOVE_PREV':
            return {
                ...state,
                trace: state.trace - 1
            }
        case 'SAVE_ANSWER':
            const newUserAnswers = [...state.userAnswers];
            newUserAnswers[action.payload.index] = action.payload.answer;
            return {
                ...state,
                userAnswers: newUserAnswers
            }
        case 'RESET_ALL':
            return {
                queue: [],
                answers: [],
                trace: 0,
                userAnswers: []
            }
        default:
            return state;
    }
}

export const startExamAction = (payload) => ({
    type: 'START_EXAM',
    payload
});

export const moveNextAction = () => ({
    type: 'MOVE_NEXT'
});

export const movePrevAction = () => ({
    type: 'MOVE_PREV'
});

export const resetAllAction = () => ({
    type: 'RESET_ALL'
});

export const saveAnswerAction = (index, answer) => ({
    type: 'SAVE_ANSWER',
    payload: { index, answer }
});
