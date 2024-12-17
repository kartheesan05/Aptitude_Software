export const questionReducer = (state = {
    queue: [],
    answers: [],
    trace: 0
}, action) => {
    switch (action.type) {
        case 'START_EXAM':
            return {
                ...state,
                queue: action.payload.question,
                answers: action.payload.answers
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
        case 'RESET_ALL':
            return {
                queue: [],
                answers: [],
                trace: 0
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
