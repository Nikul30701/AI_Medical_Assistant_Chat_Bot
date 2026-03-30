import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../features/auth/authApi';
import { Button, Input, Alert } from '../components/UI';
import ConnectionStatus from '../components/ConnectionStatus';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [register, { isLoading, error, isSuccess }] = useRegisterMutation();
    const [form, setForm] = useState({ full_name: '', email: '', password: '', password2: '' });
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (isSuccess) {
            navigate('/login');
        }
    }, [isSuccess, navigate]);

    useEffect(() => {
        if (error) {
            // Extracts nested errors from Django (e.g., { email: ["Already exists"] })
            const serverMsg = error.data?.message || 
                             (error.data && typeof error.data === 'object' 
                                ? Object.values(error.data).flat().join(' ') 
                                : 'Registration failed');
            setLocalError(serverMsg);
        }
    }, [error]);

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (localError) setLocalError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        
        if (form.password !== form.password2) {
            setLocalError("Passwords do not match");
            return;
        }
        
        try {
            await register(form).unwrap();
        } catch (err) {
            console.error('Registration error:', err);
        }
    };
    
    return (
        <div style={wrap}>
            <ConnectionStatus />
            <div style={backgroundGradient} />
            
            <div className="fade-up" style={card}>
                <div style={logoWrap}>
                    <div style={logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                    </div>
                    <h1 style={h1}>Provider Registration</h1>
                    <p style={sub}>Join the MedAnalyzer Network</p>
                </div>

                {localError && <Alert type="error">{localError}</Alert>}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: localError ? '8px' : '0' }}>
                    <Input 
                        label="Full Name" 
                        name="full_name" 
                        placeholder="Dr. Jane Doe" 
                        autoComplete="new-name" 
                        value={form.full_name} 
                        onChange={onChange} 
                        required 
                    />
                    <Input 
                        label="Medical Email" 
                        name="email" 
                        type="email" 
                        autoComplete="new-email" 
                        placeholder="jane.doe@hospital.org" 
                        value={form.email} 
                        onChange={onChange} 
                        required 
                    />
                    <Input 
                        label="Password" 
                        name="password" 
                        type="password" 
                        autoComplete="new-password" 
                        placeholder="At least 8 characters" 
                        value={form.password} 
                        onChange={onChange} 
                        required 
                    />
                    <Input 
                        label="Confirm Password" 
                        name="password2" 
                        type="password" 
                        autoComplete="new-password" 
                        placeholder="Repeat password" 
                        value={form.password2} 
                        onChange={onChange} 
                        required 
                    />
                    
                    <Button type="submit" loading={isLoading} style={primaryButton}>
                        Create Professional Account
                    </Button>
                </form>

                <p style={foot}>
                    Already have an account? <Link to="/login" style={linkStyle}>Sign in here</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;

// --- Consistent Clinical UI Styles ---

const wrap = { 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#F0F4F8', 
    padding: '40px 24px', 
    position: 'relative',
    fontFamily: '"Inter", sans-serif'
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
    maxWidth: '440px', // Slightly wider for registration
    backgroundColor: '#FFFFFF', 
    border: '1px solid #E2E8F0', 
    borderRadius: '16px', 
    padding: '40px 36px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '24px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    zIndex: 1
};

const logoWrap = { 
    textAlign: 'center', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '12px'
};

const logoIcon = { 
    width: '56px', 
    height: '56px', 
    borderRadius: '50%', 
    backgroundColor: '#0EA5E9', 
    color: '#FFFFFF', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)'
};

const h1 = { 
    fontSize: '24px', 
    fontWeight: 700, 
    color: '#0F172A', 
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
    marginTop: '12px',
    backgroundColor: '#0EA5E9',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 600,
    border: 'none'
};

const foot = { 
    textAlign: 'center', 
    fontSize: '14px', 
    color: '#64748B',
    marginTop: '8px',
    paddingTop: '24px',
    borderTop: '1px solid #F1F5F9'
};

const linkStyle = {
    color: '#0EA5E9',
    textDecoration: 'none',
    fontWeight: 600
};
