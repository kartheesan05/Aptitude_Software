import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../redux/result_reducer';
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
        department: departments[0],
        // code: '',
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
                department: selectedDept
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

        let newErrors = {};
        if (!formData.username?.trim()) newErrors.username = 'Username is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        if (!formData.regNo?.trim()) newErrors.regNo = 'Registration number is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.accessCode?.trim()) newErrors.accessCode = 'Access code is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const codeResponse = await axios.post('http://localhost:5000/api/users/verify-code', {
                accessCode: formData.accessCode
            });

            if (!codeResponse.data.valid) {
                setErrors({ accessCode: 'Invalid access code' });
                return;
            }

            const checkResponse = await axios.post('http://localhost:5000/api/users/check-user', {
                email: formData.email,
                regNo: formData.regNo
            });

            if (!checkResponse.data.canTakeTest) {
                setError('You have already taken the test. Each user can only take the test once.');
                return;
            }

            dispatch(setUserDetails({
                username: formData.username,
                email: formData.email,
                regNo: formData.regNo,
                department: formData.department.name,
                departmentId: formData.department.id,
                code: formData.code
            }));
            
            console.log('Navigating to instructions with data:', {
                username: formData.username,
                email: formData.email,
                regNo: formData.regNo,
                department: formData.department.name,
                departmentId: formData.department.id
            });
            
            navigate('/instructions');
            
        } catch (error) {
            console.error("Login error:", error);
            setErrors({ 
                general: error.response?.data?.message || 'An error occurred. Please try again.'
            });
        }
    };

    return (
        <div className='container'>
            <h1 className='title text-light'>Login</h1>

            <form className='textbox' onSubmit={handleSubmit}>
                {errors.general && <div className="error-msg">{errors.general}</div>}
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
                        value={formData.department.id}
                        onChange={handleChange}
                    >
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                    {errors.department && <div className="error">{errors.department}</div>}
                </div>

                {/* <div className="input-group">
                    <input
                        type="text"
                        name="code"
                        placeholder="Enter Code"
                        value={formData.code}
                        onChange={handleChange}
                    />
                    {errors.code && <div className="error">{errors.code}</div>}
                </div> */}

                <div className="input-group">
                    <input
                        type="text"
                        name="accessCode"
                        placeholder="Access Code"
                        value={formData.accessCode}
                        onChange={handleChange}
                        required
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