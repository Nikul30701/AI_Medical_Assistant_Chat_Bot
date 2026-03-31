import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/API';
import { Button, Input, Alert } from '../components/UI';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [register, { isLoading, error, isSuccess }] = useRegisterMutation();
    const [form, setForm] = useState({ full_name: '', email: '', password: '', password1: '' });
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (isSuccess) {
            navigate('/login');
        }
    }, [isSuccess, navigate]);

    useEffect(() => {
        if (error) {
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
        
        if (form.password !== form.password1) {
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
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden font-sans">
            
            {/* ── Background Aesthetic ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
            </div>
            
            <div className="w-full max-w-[480px] px-6 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white border border-zinc-100 rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)]">
                    
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200 mb-6 transition-transform hover:rotate-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-1">Provider Registration</h1>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Join the MedAnalyzer Network</p>
                    </div>

                    {localError && (
                        <div className="mb-6">
                            <Alert type="error" className="rounded-xl border-none bg-red-50 text-red-600 text-xs font-medium">
                                {localError}
                            </Alert>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <Input 
                                label="Full Name" 
                                name="full_name" 
                                placeholder="Dr. Jane Doe" 
                                autoComplete="new-name" 
                                value={form.full_name} 
                                onChange={onChange} 
                                required 
                                className="rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
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
                                className="rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Password" 
                                name="password" 
                                type="password" 
                                autoComplete="new-password" 
                                placeholder="8+ characters" 
                                value={form.password} 
                                onChange={onChange} 
                                required 
                                className="rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
                            />
                            <Input 
                                label="Confirm" 
                                name="password1" 
                                type="password" 
                                autoComplete="new-password" 
                                placeholder="Repeat" 
                                value={form.password1} 
                                onChange={onChange} 
                                required 
                                className="rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
                            />
                        </div>
                        
                        <Button 
                            type="submit" 
                            loading={isLoading} 
                            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-lg shadow-zinc-200 transition-all active:scale-[0.98] mt-4"
                        >
                            Create Professional Account
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-50 text-center">
                        <p className="text-xs font-medium text-zinc-400">
                            Already have an account? 
                            <Link to="/login" className="ml-2 text-zinc-900 font-bold hover:underline underline-offset-4">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale transition-all hover:grayscale-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">HIPAA Compliant Data Handling</p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
