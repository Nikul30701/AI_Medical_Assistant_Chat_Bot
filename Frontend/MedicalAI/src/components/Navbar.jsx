import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {useNavigate, useLocation} from 'react-router-dom'
import {selectCurrentUser, logout} from '../store/slices/authSlice'
import { Button } from './UI'

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const {pathname} = useLocation()
    const user = useSelector(selectCurrentUser)

    return (
        <header style={{
            height: '58px', display:'flex', alignItems:'center', justifyContent:'space-between',
            padding: '0 28px', position:'sticky', top:0, zIndex:100,
            background: 'rgba(8,10,13,0.88)', backdropFilter:'blur(14px)',
            borderBottom: '1px solid var(--border)',
        }}>
        {/* Logo */}
            <div onClick={() => navigate('/dashboard')} style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}>
                <div style={{
                    width:32, height:32, borderRadius:'9px', fontSize:'16px',
                    background:'linear-gradient(140deg,#4b83f0,#6c5ce7)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                }}>⚕</div>
                <span style={{ fontSize:'15px', fontWeight:600, letterSpacing:'-0.025em' }}>MedAnalyzer</span>
            </div>

        {/* Right */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                {pathname !== '/upload' && (
                    <Button size="sm" onClick={() => navigate('/upload')}>+ Upload</Button>
                )}

            {/* Avatar pill */}
                <div style={{
                    display:'flex', alignItems:'center', gap:'8px',
                    padding:'5px 12px 5px 6px', borderRadius:'99px',
                    background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)',
                }}>
                <div style={{
                    width:26, height:26, borderRadius:'50%',
                    background:'linear-gradient(135deg,#4b83f0,#2fd492)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'11px', fontWeight:600, color:'#fff', flexShrink:0,
                }}>
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize:'13px', color:'var(--text2)', maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user?.full_name?.split(' ')[0]}
                </span>
            </div>

            <Button variant="subtle" size="sm" onClick={() => { dispatch(logout()); navigate('/login') }}
                style={{ color:'var(--text3)', fontSize:'13px' }}>
                Logout
            </Button>
            </div>
        </header>
    )
}

export default Navbar