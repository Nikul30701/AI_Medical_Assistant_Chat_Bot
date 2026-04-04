// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRegisterMutation } from '../services/API';
import { Button, Input, Alert } from '../components/UI';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [register, { isLoading, error: apiError, isSuccess }] = useRegisterMutation();
  
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    password1: ''
  });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Pre-fill email if passed from a landing page / login attempt
  useEffect(() => {
    if (location.state?.email && !form.email) {
      setForm(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state, form.email]);

  useEffect(() => { 
    if (isSuccess) navigate('/login', { state: { registered: true } }); 
  }, [isSuccess, navigate]);

  // Handle complex API error objects
  useEffect(() => {
    if (apiError) {
      const msg =
        apiError?.data?.message ||
        (apiError?.data && typeof apiError.data === 'object'
          ? Object.values(apiError.data).flat().join(' ')
          : apiError?.error || 'Registration failed');
      setError(msg);
    }
  }, [apiError]);

  const onChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    if (form.password !== form.password1) {
      return setError('Passwords do not match');
    }
    
    try { 
      await register(form).unwrap(); 
    } catch (err) { 
      console.error('Registration flow interrupted:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-[440px] fade-up">
        
        {/* Main Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center
                          text-white shadow-lg shadow-slate-200 mb-5 transform rotate-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create account</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Start analyzing medical documents today</p>
          </div>

          {error && (
            <div className="mb-6 scale-in">
              <Alert type="error" className="py-3 px-4">{error}</Alert>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <Input 
              label="Full Name" 
              name="full_name" 
              placeholder="Dr. Alex Rivera"
              autoComplete="name" 
              value={form.full_name} 
              onChange={onChange} 
              required 
            />
            
            <Input 
              label="Professional Email" 
              name="email" 
              type="email" 
              autoComplete="email"
              placeholder="alex.rivera@clinic.org" 
              value={form.email} 
              onChange={onChange} 
              required 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Input 
                  label="Password" 
                  name="password" 
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="8+ chars" 
                  value={form.password} 
                  onChange={onChange} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 bottom-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? (
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
              <div className="relative">
                <Input 
                  label="Confirm" 
                  name="password1" 
                  type={showConfirmPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat it" 
                  value={form.password1} 
                  onChange={onChange} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(v => !v)}
                  className="absolute right-3 bottom-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showConfirmPwd ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPwd ? (
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
            </div>

            <div className="pt-2">
              <Button type="submit" loading={isLoading} className="w-full py-4" size="lg">
                Create Account
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <footer className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-slate-900 font-bold hover:text-indigo-600 transition-colors">
                Sign in
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}