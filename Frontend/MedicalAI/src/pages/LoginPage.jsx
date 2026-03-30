import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/auth/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { Button, Input, Alert } from '../components/UI';
import ConnectionStatus from '../components/ConnectionStatus';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [login, { isLoading }] = useLoginMutation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [localError, setLocalError] = useState('');

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (localError) setLocalError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        
        try {
            const { access, refresh } = await login(form).unwrap();
            const res = await fetch(`${BASE}/api/accounts/me/`, {
                headers: { Authorization: `Bearer ${access}` }
            });
            
            if (!res.ok) throw new Error('Failed to fetch user profile');
            
            const user = await res.json();
            dispatch(setCredentials({ user, access, refresh }));
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setLocalError(err.data?.message || err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div style={wrap}>
            <ConnectionStatus />
            {/* Subtle background pattern/gradient representing a clean clinical environment */}
            <div style={backgroundGradient} />
            
            <div className="fade-up" style={card}>
                <div style={logoWrap}>
                    <div style={logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <h1 style={h1}>MedAnalyzer</h1>
                    <p style={sub}>Secure Provider Portal</p>
                </div>

                {localError && <Alert type="error">{localError}</Alert>}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: localError ? '8px' : '0' }}>
                    <Input 
                        label="Work Email"    
                        name="email"    
                        type="email"   
                        autoComplete="email" 
                        placeholder="dr.smith@hospital.org" 
                        value={form.email}    
                        onChange={onChange} 
                        required 
                    />
                    <Input 
                        label="Password" 
                        name="password" 
                        type="password" 
                        autoComplete="current-password"
                        placeholder="••••••••"        
                        value={form.password} 
                        onChange={onChange} 
                        required 
                    />
                    <Button type="submit" loading={isLoading} style={primaryButton}>
                        Secure Sign In
                    </Button>
                </form>

                <p style={foot}>
                    Need portal access? <Link to="/register" style={linkStyle}>Register as Provider</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

// --- Clean, Clinical UI Styles ---

const wrap = { 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#F0F4F8', // Very soft blue/gray medical background
    padding: '24px', 
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const backgroundGradient = { 
    position: 'absolute', 
    inset: 0, 
    background: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)', 
    opacity: 0.5,
    pointerEvents: 'none' 
};

const card = { 
    width: '100%', 
    maxWidth: '420px', 
    backgroundColor: '#FFFFFF', // Clean white
    border: '1px solid #E2E8F0', // Soft border
    borderRadius: '16px', 
    padding: '40px 36px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '24px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', // Soft, elevated shadow
    position: 'relative',
    zIndex: 1
};

const logoWrap = { 
    textAlign: 'center', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '12px',
    marginBottom: '8px'
};

const logoIcon = { 
    width: '56px', 
    height: '56px', 
    borderRadius: '50%', // Circular logo feels more organic and friendly
    backgroundColor: '#0EA5E9', // Trustworthy medical blue
    color: '#FFFFFF', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)' // Glowing blue shadow
};

const h1 = { 
    fontSize: '24px', 
    fontWeight: 700, 
    color: '#0F172A', // Dark slate instead of harsh black
    letterSpacing: '-0.02em',
    margin: 0
};

const sub = { 
    fontSize: '15px', 
    color: '#64748B', 
    margin: 0 
};

const primaryButton = {
    width: '100%', 
    marginTop: '8px',
    backgroundColor: '#144cd8',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 600,
    border: 'none',
    boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)'
};

const foot = { 
    textAlign: 'center', 
    fontSize: '14px', 
    color: '#64748B',
    marginTop: '8px',
    paddingTop: '24px',
    borderTop: '1px solid #F1F5F9' // Subtle divider line
};

const linkStyle = {
    color: '#0EA5E9', // Matches the primary blue
    textDecoration: 'none',
    fontWeight: 600
};
