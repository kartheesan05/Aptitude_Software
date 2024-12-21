import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
    const [email, setEmail] = useState('');
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [currentCode, setCurrentCode] = useState('');

    const searchUser = async () => {
        setError('');
        setUserData(null);
        setLoading(true);

        try {
            if (!email?.trim()) {
                setError('Please enter an email');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/users/search', {
                params: { email: email.trim() }
            });

            if (response.data) {
                setUserData(response.data);
            } else {
                setError('No user found');
            }
        } catch (error) {
            console.error("Search error:", error);
            setError(error.response?.data?.message || 'Error searching for user');
        } finally {
            setLoading(false);
        }
    };

    const resetTest = async () => {
        try {
            if (!userData?.email) {
                console.error("No email found");
                return;
            }
            
            if (!window.confirm('Are you sure you want to reset this user\'s test? This action cannot be undone.')) {
                return;
            }

            setResetLoading(true);
            console.log("Resetting test for email:", userData.email);

            const response = await axios.post('http://localhost:5000/api/users/reset-test', 
                { email: userData.email },
                { 
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Reset response:", response.data);

            if (response.data.status === 'success') {
                alert('Test reset successfully');
                // Refresh user data
                await searchUser();
            }
        } catch (error) {
            console.error("Reset error:", error);
            alert(error.response?.data?.message || 'Error resetting test');
        } finally {
            setResetLoading(false);
        }
    };

    const getCurrentCode = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/current-code');
            setCurrentCode(response.data.code);
        } catch (error) {
            console.error("Error fetching code:", error);
        }
    };

    const updateAccessCode = async () => {
        try {
            if (!newCode.trim()) {
                alert('Please enter a new access code');
                return;
            }

            const response = await axios.post('http://localhost:5000/api/admin/update-code', {
                code: newCode.trim()
            });

            if (response.data.success) {
                alert('Access code updated successfully');
                setNewCode('');
                getCurrentCode();
            }
        } catch (error) {
            console.error("Error updating code:", error);
            alert(error.response?.data?.message || 'Error updating access code');
        }
    };

    useEffect(() => {
        getCurrentCode();
    }, []);

    return (
        <div className='container'>
            <h1 className='title text-light'>Admin Dashboard</h1>

            <div className="search-section">
                <input
                    type="text"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="search-input"
                />
                
                <button 
                    onClick={searchUser} 
                    className="search-btn"
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {userData && (
                <div className="user-details">
                    <h2>User Details</h2>
                    <div className="details-grid">
                        <div className="detail-item">
                            <strong>Name:</strong> 
                            <span>{userData.name}</span>
                        </div>
                        <div className="detail-item">
                            <strong>Email:</strong> 
                            <span>{userData.email}</span>
                        </div>
                        <div className="detail-item">
                            <strong>Registration Number:</strong> 
                            <span>{userData.regNo}</span>
                        </div>
                        <div className="detail-item">
                            <strong>Department:</strong> 
                            <span>{userData.department}</span>
                        </div>
                        <div className="detail-item">
                            <strong>Status:</strong> 
                            <span className={`status-${userData.status}`}>
                                {userData.status}
                            </span>
                        </div>
                        {userData.status === 'completed' && (
                            <>
                                <div className="detail-item">
                                    <strong>Score:</strong> 
                                    <span>{userData.score}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Total Questions:</strong> 
                                    <span>{userData.totalQuestions}</span>
                                </div>
                            </>
                        )}
                    </div>
                    
                    {userData.status === 'completed' && (
                        <div className="action-buttons">
                            <button 
                                onClick={resetTest}
                                className="reset-btn"
                                disabled={resetLoading}
                            >
                                {resetLoading ? 'Resetting...' : 'Reset Test'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="access-code-section">
                <h2>Access Code Management</h2>
                <div className="current-code">
                    Current Access Code: <strong>{currentCode}</strong>
                </div>
                <div className="code-update-form">
                    <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        placeholder="Enter new access code"
                        className="search-input"
                    />
                    <button 
                        onClick={updateAccessCode}
                        className="search-btn"
                    >
                        Update Access Code
                    </button>
                </div>
            </div>
        </div>
    );
}
