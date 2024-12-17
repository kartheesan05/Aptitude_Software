import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../redux/result_reducer';
import '../styles/Login.css';
 
const departments = [
    { id: 'cs', name: 'Computer Science', coreCategory: 'cs' },
    { id: 'it', name: 'Information Technology', coreCategory: 'it' },
    { id: 'ece', name: 'Electronics', coreCategory: 'ec' },
    { id: 'eee', name: 'Electrical', coreCategory: 'ee' },
    { id: 'mech', name: 'Mechanical', coreCategory: 'mech' },
    { id: 'civil', name: 'Civil', coreCategory: 'civil' },
    { id: 'chem', name: 'Chemical', coreCategory: 'chem' },
    { id: 'bio', name: 'Biotechnology', coreCategory: 'bio' },
    { id: 'aids', name: 'AI & DS', coreCategory: 'aids' },
    { id: 'auto', name: 'Automobile', coreCategory: 'auto' },
    { id: 'marine', name: 'Marine', coreCategory: 'marine' }
];

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        regNo: '',
        department: '',
        code: ''
    });
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        regNo: '',
        department: departments[0],
        code: ''
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
            setErrors(prev => ({...prev, email: 'Please use your SVCE email (@svce.ac.in)'}));
            setFormData(prev => ({...prev, [name]: value}));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        const { username, email, regNo, department, code } = formData;

        if (!username) newErrors.username = 'Username is required';
        if (!email) newErrors.email = 'Email is required';
        else if (!validateEmail(email)) newErrors.email = 'Please use your SVCE email (@svce.ac.in)';
        if (!regNo) newErrors.regNo = 'Registration number is required';
        if (!department) newErrors.department = 'Department is required';
        if (!code) newErrors.code = 'Code is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            dispatch(setUserDetails({
                username,
                email,
                regNo,
                department: department.name,
                departmentId: department.id,
                code
            }));
            
            console.log('Navigating to instructions...');
            navigate('/instructions');
            
        } catch (error) {
            setErrors(prev => ({...prev, general: "Error during login"}));
        }
    };

    return (
        <div className='container'>
            <h1 className='title text-light'>Quiz Login</h1>

            <form className='textbox' onSubmit={handleSubmit}>
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
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <div className="error">{errors.email}</div>}
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

                <div className="input-group">
                    <input
                        type="text"
                        name="code"
                        placeholder="Enter Code"
                        value={formData.code}
                        onChange={handleChange}
                    />
                    {errors.code && <div className="error">{errors.code}</div>}
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