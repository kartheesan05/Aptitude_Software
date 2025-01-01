import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    
    if (username === 'admin' && password === 'admin123') {
      // Admin dashboard
      navigate('/admin-dashboard');
    } else if (username === 'ques' && password === 'ques123') {
      // Question uploader dashboard
      navigate('/question-upload');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className='container'>
      <h1 className='title text-light'>Admin Login</h1>
      <div className="form-container">
        <form id="admin-form" onSubmit={handleAdminLogin}>
          <div className="input-group">
            <label htmlFor="username" className="label">Username</label>
            <input 
              className="input-field" 
              type="text" 
              id="username"
              placeholder='Enter username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="label">Password</label>
            <input 
              className="input-field" 
              type="password" 
              id="password"
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className='start'>
            <button type="submit" className='btn'>Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
