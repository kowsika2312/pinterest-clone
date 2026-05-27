import React, { useState } from 'react';
import './Auth.css';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

    
      if (!response.ok) {
        throw new Error(data.message || (isLogin ? 'Invalid username or password' : 'Registration failed'));
      }

      if (isLogin) {
        alert("Welcome back!");
        onLoginSuccess(data);
      } else {
        alert("Registration successful! Please login.");
        setIsLogin(true);
        setPassword('');
        setError(''); 
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const handleToggleView = () => {
    setIsLogin(!isLogin);
    setError('');       
    setUsername('');    
    setPassword('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">P</div>
        <h2>{isLogin ? 'Welcome to Pinterest' : 'Create an Account'}</h2>
        
        {error && <div className="auth-error" style={{ color: 'red', marginBottom: '15px', fontWeight: '500' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder={isLogin ? "Enter your password" : "Create a password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <div className="auth-toggle">
          <span>{isLogin ? 'Not on Pinterest yet?' : 'Already have an account?'}</span>
          <button onClick={handleToggleView} className="toggle-link-btn">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}