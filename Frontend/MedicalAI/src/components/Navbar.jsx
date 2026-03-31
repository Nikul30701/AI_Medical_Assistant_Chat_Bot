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
        <header className="h-16 flex items-center justify-between px-6 md:px-10 sticky top-0 z-50 
                            bg-white/80 backdrop-blur-md border-b border-gray-100">
          {/* Logo Section */}
            <div 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 cursor-pointer group"
            >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg 
                            bg-black text-white shadow-sm transition-all 
                            group-hover:bg-indigo-600 group-hover:scale-105">
              ⚕
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-[17px] tracking-[-0.02em] text-gray-900 block leading-none">
                MedAnalyzer
              </span>
              <span className="text-[10px] font-bold text-indigo-600 tracking-[0.1em] uppercase">
                Intelligence
              </span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-6">
            
            {/* Action Area */}
            <div className="flex items-center gap-3">
                {pathname !== '/upload' && (
                    <Button 
                        size="sm"
                        onClick={() => navigate('/upload')}
                        className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-5 text-xs font-medium transition-all active:scale-95"
                    >
                        + New Analysis
                    </Button>
                )}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                <div className="flex items-center gap-3 group cursor-default">
                    {/* User Info - Subtle Typography */}
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-semibold text-gray-900 leading-none mb-1">
                            {user?.full_name?.split(' ')[0] || 'User'}
                        </p>
                        <div className="flex items-center justify-end gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Active</p>
                        </div>
                    </div>

                    {/* Avatar - Clean Gradient */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white
                                    bg-gradient-to-tr from-indigo-500 to-blue-400 border-2 border-white shadow-sm">
                        {user?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"
                    title="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </div>
    </header>
    );
};

export default Navbar;
