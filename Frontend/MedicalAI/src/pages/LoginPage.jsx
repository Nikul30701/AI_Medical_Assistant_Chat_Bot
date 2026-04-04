// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../services/API';
import { setCredentials } from '../store/slices/authSlice';
import { Button, Input, Alert } from '../components/UI';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [login, { isLoading }] = useLoginMutation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(form).unwrap();
      
      dispatch(setCredentials({
        user: res.user || { email: form.email },
        access: res?.access,
        refresh: res?.refresh,
      }));
      navigate('/dashboard');
    } catch (err) {
      const message = err?.data?.detail || err?.data?.message || 'Invalid email or password';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-[400px] fade-up">
        
        {/* Card Container */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          
          {/* Brand Header */}
          <header className="flex flex-col items-center text-center mb-10">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center
                          text-white text-xl shadow-lg shadow-slate-200 mb-5 transform -rotate-3">
              ⚕
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Sign in to your medical dashboard</p>
          </header>

          {error && (
            <div className="mb-6 scale-in">
              <Alert type="error" className="py-3 px-4">{error}</Alert>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <Input 
              label="Professional Email" 
              name="email" 
              type="email" 
              autoComplete="email"
              placeholder="name@hospital.org" 
              value={form.email} 
              onChange={onChange} 
              required 
            />

            <div>
              <div className="relative">
                <Input 
                  label="Secure Password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••" 
                  value={form.password} 
                  onChange={onChange} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 bottom-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
      
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.011 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  type="button"
                  className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              loading={isLoading} 
              disabled={isLoading} 
              className="w-full py-4 mt-2" 
              size="lg"
            >
              Sign In
            </Button>
          </form>

          {/* Footer Link */}
          <footer className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm font-medium text-slate-500">
              New to the platform?{' '}
              <Link to="/register" className="text-slate-900 font-bold hover:text-indigo-600 transition-colors">
                Create account
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}