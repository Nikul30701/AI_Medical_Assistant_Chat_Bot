import React, { useState, useEffect } from 'react';
import { Alert } from './UI';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/accounts/', {
          method: 'GET',
          credentials: 'include',
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          const data = await response.json();
          setStatus('connected');
          setMessage(data.message || 'Backend connected');
        } else {
          setStatus('error');
          setMessage(`Backend error: ${response.status}`);
        }
      } catch (error) {
        setStatus('disconnected');
        setMessage('Backend not running - start Django server');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'connected') {
    return (
      <Alert type="success" style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000, maxWidth: '300px' }}>
        ✅ {message}
      </Alert>
    );
  }

  if (status === 'disconnected') {
    return (
      <Alert type="error" style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000, maxWidth: '300px' }}>
        ❌ {message}
      </Alert>
    );
  }

  return (
    <Alert type="info" style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000, maxWidth: '300px' }}>
      🔍 Checking backend connection...
    </Alert>
  );
};

export default ConnectionStatus;
