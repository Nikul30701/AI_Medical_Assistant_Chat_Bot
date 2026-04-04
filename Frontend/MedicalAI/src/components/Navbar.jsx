import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { selectCurrentUser, logout } from '../store/slices/authSlice';
import { Button } from './UI';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const user = useSelector(selectCurrentUser);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full px-4 py-3">
            {/* Glass Container */}
            <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6 
                            bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-2xl">
                
                {/* Brand Identity */}
                <div 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-3.5 cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl 
                                    bg-slate-900 text-white shadow-lg shadow-slate-200/50 
                                    transition-all duration-300 group-hover:bg-indigo-600 group-hover:-rotate-3">
                        ⚕
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="font-extrabold text-[18px] tracking-tight text-slate-900 leading-none">
                            MedAnalyzer
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                            Core <span className="text-indigo-500">v2.0</span>
                        </p>
                    </div>
                </div>

                {/* Navigation & User Actions */}
                <div className="flex items-center gap-3 md:gap-8">
                    
                    {/* Primary Action */}
                    <nav className="flex items-center pr-2 md:pr-8 border-r border-slate-100">
                        {pathname !== '/upload' && (
                            <Button 
                                size="sm"
                                onClick={() => navigate('/upload')}
                                className="bg-slate-900 text-white hover:bg-indigo-600 rounded-xl px-4 py-2.5
                                         text-[13px] font-bold transition-all hover:shadow-lg hover:shadow-indigo-100 active:scale-95"
                            >
                                <span className="mr-1.5">+</span> Analyze Document
                            </Button>
                        )}
                    </nav>

                    {/* Profile Section */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="hidden md:block text-right">
                                <p className="text-[13px] font-bold text-slate-900 leading-none mb-1">
                                    {user?.full_name || 'Medical Officer'}
                                </p>
                                <div className="flex items-center justify-end gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Verified
                                    </p>
                                </div>
                            </div>

                            {/* Refined Avatar */}
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
                                            bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 
                                            border border-slate-200/50 shadow-inner group-hover:scale-105 transition-transform">
                                {user?.full_name?.split(' ')[0]?.toUpperCase() || 'M'}
                            </div>
                        </div>

                        {/* Logout with specific style */}
                        <button 
                            onClick={handleLogout}
                            className="group p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50/50 
                                       transition-all duration-200 rounded-xl border border-transparent hover:border-red-100"
                            title="Sign Out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;