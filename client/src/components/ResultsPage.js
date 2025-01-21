import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios/axios';
import ResultsTable from './ResultsTable';
import '../styles/ResultsPage.css';

export default function ResultsPage() {
    const [results, setResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            navigate("/");
        }

        const role = sessionStorage.getItem("role");
        if (role !== "admin") {
            navigate("/");
        }

        fetchResults();
    }, [navigate]);

    const fetchResults = async () => {
        try {
            const response = await api.get('/api/admin/completed-tests');
            setResults(response.data);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    };

    const handleBack = () => {
        navigate('/admin-dashboard');
    };

    return (
        <div className="results-page-container">
            <div className="results-header">
                <h1>Test Results</h1>
                <button onClick={handleBack} className="back-btn">
                    Back to Dashboard
                </button>
            </div>
            <ResultsTable 
                results={results} 
                onViewDetails={(email) => navigate(`/admin-dashboard?email=${email}`)}
            />
        </div>
    );
} 