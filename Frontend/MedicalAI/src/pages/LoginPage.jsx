import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../services/API';
import { setCredentials } from '../store/slices/authSlice';
import { Button, Input, Alert } from '../components/UI';

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
            console.log('Login response:', { access, refresh });
            
            // For now, set minimal user data - the actual user data will be fetched by getMe query
            const credentials = { 
                user: { email: form.email, full_name: form.email.split('@')[0] }, 
                access, 
                refresh 
            };
            console.log('Setting credentials:', credentials);
            
            dispatch(setCredentials(credentials));
            console.log('After dispatch - checking localStorage:', {
                accessToken: localStorage.getItem('accessToken'),
                refreshToken: localStorage.getItem('refreshToken')
            });
            
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setLocalError(err.data?.message || err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden font-sans">
            
            {/* ── Background Aesthetic ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
            </div>
            
            <div className="w-full max-w-[440px] px-6 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white border border-zinc-100 rounded-[32px] p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)]">
                    
                    {/* Logo Section */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200 mb-6 group transition-transform hover:scale-105">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-1">MedAnalyzer</h1>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Provider Portal</p>
                    </div>

                    {localError && (
                        <div className="mb-6">
                            <Alert type="error" className="rounded-xl border-none bg-red-50 text-red-600 text-xs font-medium">
                                {localError}
                            </Alert>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-5">
                        <Input 
                            label="Work Email"    
                            name="email"    
                            type="email"   
                            autoComplete="email" 
                            placeholder="name@hospital.org" 
                            value={form.email}    
                            onChange={onChange} 
                            required 
                            className="rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
                        />
                        
                        <div className="space-y-1">
                            <Input 
                                label="Password" 
                                name="password" 
                                type="password" 
                                autoComplete="current-password"
                                placeholder="••••••••"        
                                value={form.password} 
                                onChange={onChange} 
                                required 
                                className="rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
                            />
                            <div className="flex justify-end">
                                <button type="button" className="text-[11px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-wider">
                                    Forgot?
                                </button>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            loading={isLoading} 
                            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-lg shadow-zinc-200 transition-all active:scale-[0.98] mt-2"
                        >
                            Secure Sign In
                        </Button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-zinc-50 text-center">
                        <p className="text-xs font-medium text-zinc-400">
                            Need portal access? 
                            <Link to="/register" className="ml-2 text-zinc-900 font-bold hover:underline underline-offset-4">
                                Register as Provider
                            </Link>
                        </p>
                    </div>
                </div>
                
                <p className="text-center mt-8 text-[10px] text-zinc-400 font-bold uppercase tracking-[0.1em]">
                    Strictly for Authorized Healthcare Personnel
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
