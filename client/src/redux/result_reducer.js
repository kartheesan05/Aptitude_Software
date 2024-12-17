import { createSlice } from "@reduxjs/toolkit"

export const resultReducer = (state = {
    queue: [],
    answers: [],
    trace: 0,
    result: [],
    username: '',
    email: '',
    department: '',
    departmentId: ''
}, action) => {
    switch (action.type) {
        case 'SET_USER_DETAILS':
            return {
                ...state,
                username: action.payload.username,
                email: action.payload.email,
                department: action.payload.department,
                departmentId: action.payload.departmentId
            }
        case 'SET_RESULT':
            return {
                ...state,
                result: [...state.result, action.payload]
            }
        case 'UPDATE_RESULT':
            const { trace, checked } = action.payload;
            const newResult = [...state.result];
            newResult[trace] = checked;
            return {
                ...state,
                result: newResult
            }
        case 'PUSH_RESULT':
            return {
                ...state,
                result: [...state.result, action.payload]
            }
        case 'RESET_RESULT':
            return {
                ...state,
                result: [],
                username: '',
                email: '',
                department: '',
                departmentId: ''
            }
        default:
            return state;
    }
}

export const setUserDetails = (payload) => ({
    type: 'SET_USER_DETAILS',
    payload
});

export const setResult = (result) => ({
    type: 'SET_RESULT',
    payload: result
});

export const updateResult = (index) => ({
    type: 'UPDATE_RESULT',
    payload: index
});

export const pushResultAction = (result) => ({
    type: 'PUSH_RESULT',
    payload: result
});

export const resetResultAction = () => ({
    type: 'RESET_RESULT'
});

export const updateResultAction = (payload) => ({
    type: 'UPDATE_RESULT',
    payload
});
