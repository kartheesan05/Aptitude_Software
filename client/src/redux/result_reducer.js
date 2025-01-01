import { createSlice } from "@reduxjs/toolkit"

export const resultReducer = (state = {
    username: '',
    email: '',
    regNo: '',
    department: '',
    departmentId: '',
    result: new Array(50).fill(undefined)
}, action) => {
    switch (action.type) {
        case 'SET_USER_DETAILS':
            return {
                ...state,
                username: action.payload.username,
                email: action.payload.email,
                regNo: action.payload.regNo,
                department: action.payload.department,
                departmentId: action.payload.departmentId
            }
        case 'SET_RESULT':
            return {
                ...state,
                result: action.payload
            }
        case 'UPDATE_RESULT':
            const { trace, checked } = action.payload;
            const newResult = [...state.result];
            newResult[trace] = checked;
            return {
                ...state,
                result: newResult
            }
        case 'RESET_RESULT':
            return {
                ...state,
                result: []
            }
        default:
            return state;
    }
}

export const setUserDetails = (userDetails) => {
    return {
        type: 'SET_USER_DETAILS',
        payload: userDetails
    }
}

export const updateResult = (payload) => {
    return {
        type: 'UPDATE_RESULT',
        payload: payload
    }
}

export const resetResultAction = () => {
    return {
        type: 'RESET_RESULT'
    }
}
