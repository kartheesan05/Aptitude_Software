import React, { useState, useMemo } from 'react';
import '../styles/ResultsTable.css';

export default function ResultsTable({ results, onViewDetails }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'dept',
        direction: 'asc'
    });

    // Memoized sorted and filtered results
    const processedResults = useMemo(() => {
        let filteredResults = results;
        
        // Apply search filter
        if (searchTerm) {
            filteredResults = results.filter(result => 
                result.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                result.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                result.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                result.dept.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        return filteredResults.sort((a, b) => {
            if (sortConfig.key === 'dept') {
                // First sort by department
                const deptCompare = a.dept.localeCompare(b.dept);
                // If same department, sort by name
                if (deptCompare === 0) {
                    return a.username.localeCompare(b.username);
                }
                return deptCompare * (sortConfig.direction === 'asc' ? 1 : -1);
            }

            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [results, searchTerm, sortConfig]);

    const requestSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: 
                prevConfig.key === key && prevConfig.direction === 'asc' 
                    ? 'desc' 
                    : 'asc',
        }));
    };

    return (
        <div className="results-table-container">
            <div className="table-controls">
                <input
                    type="text"
                    placeholder="Search by name, email, reg no, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input table-search"
                />
            </div>
            
            <table className="results-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort('username')}>
                            Name {sortConfig.key === 'username' && (
                                <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                        </th>
                        <th onClick={() => requestSort('regNo')}>
                            Registration No {sortConfig.key === 'regNo' && (
                                <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                        </th>
                        <th onClick={() => requestSort('email')}>
                            Email {sortConfig.key === 'email' && (
                                <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                        </th>
                        <th onClick={() => requestSort('dept')}>
                            Department {sortConfig.key === 'dept' && (
                                <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                        </th>
                        <th onClick={() => requestSort('points')}>
                            Score {sortConfig.key === 'points' && (
                                <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {processedResults.map((result, index) => (
                        <tr key={index}>
                            <td>{result.username}</td>
                            <td>{result.regNo}</td>
                            <td>{result.email}</td>
                            <td>{result.dept}</td>
                            <td>{result.points}</td>
                            <td>
                                <button 
                                    onClick={() => onViewDetails(result.email)}
                                    className="details-btn"
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {processedResults.length === 0 && (
                <div className="no-results">No matching results found</div>
            )}
        </div>
    );
}
