import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedPassword = localStorage.getItem('clip_auth_token');
    if (savedPassword) {
      setIsAuthenticated(true);
      setPassword(savedPassword);
    }
  }, []);

  const handleLogin = (pwd: string) => {
    setIsAuthenticated(true);
    setPassword(pwd);
    localStorage.setItem('clip_auth_token', pwd);
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    localStorage.removeItem('clip_auth_token');
  }

  return (
    <>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard 
            password={password}
            onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default App;