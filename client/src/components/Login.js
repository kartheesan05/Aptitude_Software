import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetResultAction, setUserDetails } from '../redux/result_reducer';
import { resetAllAction } from '../redux/question_reducer';
import '../styles/Login.css';
import axios from 'axios';

const departments = [
    { id: 'cs', name: 'Computer Science and Engineering', coreCategory: 'cs' },
    { id: 'it', name: 'Information Technology', coreCategory: 'it' },
    { id: 'ec', name: 'Electronics and Communication Engineering', coreCategory: 'ec' },
    { id: 'ee', name: 'Electrical and Electronics Engineering', coreCategory: 'ee' },
    { id: 'mech', name: 'Mechanical Engineering', coreCategory: 'mech' },
    { id: 'civil', name: 'Civil Engineering', coreCategory: 'civil' },
    { id: 'chem', name: 'Chemical Engineering', coreCategory: 'chem' },
    { id: 'bio', name: 'Biotechnology', coreCategory: 'bio' },
    { id: 'aids', name: 'Artificial Intelligence and Data Science', coreCategory: 'aids' },
    { id: 'auto', name: 'Automobile Engineering', coreCategory: 'auto' },
    { id: 'marine', name: 'Marine Engineering', coreCategory: 'marine' }
];

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        regNo: '',
        department: '',
        accessCode: ''
    });

    const validateEmail = (email) => {
        return email.endsWith('@svce.ac.in');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors(prev => ({...prev, [name]: ''}));

        if (name === 'department') {
            const selectedDept = departments.find(dept => dept.id === value);
            setFormData(prev => ({
                ...prev,
                department: selectedDept || ''
            }));
        } else if (name === 'email' && value && !validateEmail(value)) {
            setErrors(prev => ({...prev, email: 'Please use your college email'}));
            setFormData(prev => ({...prev, [name]: value}));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setError('');

        let newErrors = {};
        if (!formData.username?.trim()) newErrors.username = 'Username is required';
        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please use your college email';
        }
        if (!formData.regNo?.trim()) newErrors.regNo = 'Registration number is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.accessCode?.trim()) newErrors.accessCode = 'Access code is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            dispatch(resetAllAction());
            dispatch(resetResultAction());

            const sessionResponse = await axios.post('http://localhost:5000/api/users/check-session', {
                email: formData.email,
                regNo: formData.regNo
            });

            if (sessionResponse.data.hasActiveSession) {
                setError('This user already has an active test session in another window/browser. Please complete the test in the original session.');
                return;
            }

            if (!sessionResponse.data.canTakeTest) {
                setError('You have already taken this test. Each user is allowed only one attempt.');
                return;
            }

            const codeResponse = await axios.post('http://localhost:5000/api/users/verify-code', {
                accessCode: formData.accessCode
            });

            if (!codeResponse.data.valid) {
                setErrors({ accessCode: 'Invalid access code' });
                return;
            }

            await axios.post('http://localhost:5000/api/users/create-session', {
                email: formData.email,
                regNo: formData.regNo
            });

            dispatch(setUserDetails({
                username: formData.username,
                email: formData.email,
                regNo: formData.regNo,
                department: formData.department.name,
                departmentId: formData.department.id
            }));
            
            navigate('/instructions');
            
        } catch (error) {
            console.error("Login error:", error);
            setError(error.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className='container'>
            <h1 className='title text-light'>Login</h1>

            <form className='textbox' onSubmit={handleSubmit}>
                {error && (
                    <div className="error-msg" style={{ 
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '15px',
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }}>
                        {error}
                    </div>
                )}
                <div className="input-group">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    {errors.username && <div className="error">{errors.username}</div>}
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        name="regNo"
                        placeholder="Registration Number"
                        value={formData.regNo}
                        onChange={handleChange}
                    />
                    {errors.regNo && <div className="error">{errors.regNo}</div>}
                </div>

                <div className="input-group">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <div className="error">{errors.email}</div>}
                </div>

                <div className="input-group">
                    <select
                        name="department"
                        value={formData.department ? formData.department.id : ''}
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Department</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                    {errors.department && <div className="error">{errors.department}</div>}
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        name="accessCode"
                        placeholder="Access Code"
                        value={formData.accessCode}
                        onChange={handleChange}
                    />
                    {errors.accessCode && <div className="error">{errors.accessCode}</div>}
                </div>

                <button type="submit" className='btn'>
                    Start Quiz
                </button>
            </form>

            <div className="auth-links">
                <Link to="/admin-login" className='auth-link'>Admin Login</Link>
            </div>
        </div>
    );
}