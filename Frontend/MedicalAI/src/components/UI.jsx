// src/components/UI.jsx
// ─── Design tokens used inline ────────────────────────────────────────────────
// All components use CSS vars from index.css so they adapt automatically.

/* ── Spinner ──────────────────────────────────────────────────────────────── */
export function Spinner({ size = 20, color = 'var(--accent)' }) {
  return (
    <svg className="spin" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" opacity=".15" />
      <path d="M12 2 a10 10 0 0 1 10 10" />
    </svg>
  )
}

/* ── Button ───────────────────────────────────────────────────────────────── */
const BV = {
  primary: { background:'var(--accent)', color:'#fff', border:'none' },
  ghost:   { background:'rgba(255,255,255,0.04)', color:'var(--text)', border:'1px solid var(--border2)' },
  danger:  { background:'rgba(240,100,100,0.1)',  color:'var(--red)',  border:'1px solid rgba(240,100,100,0.2)' },
  subtle:  { background:'transparent', color:'var(--text2)', border:'none' },
}
const BS = {
  xs: { padding:'4px 10px',  fontSize:'12px', borderRadius:'7px' },
  sm: { padding:'7px 14px',  fontSize:'13px', borderRadius:'9px' },
  md: { padding:'10px 18px', fontSize:'14px', borderRadius:'var(--r-sm)' },
  lg: { padding:'13px 24px', fontSize:'15px', borderRadius:'var(--r)' },
}
export function Button({ children, variant='primary', size='md', loading, style={}, className='', ...p }) {
  return (
    <button
      className={className}
      disabled={p.disabled || loading}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'7px',
        fontWeight:500, cursor:'pointer', letterSpacing:'-0.01em', whiteSpace:'nowrap',
        transition:'opacity .15s, transform .1s', flexShrink:0,
        opacity: (p.disabled || loading) ? 0.45 : 1,
        ...BV[variant], ...BS[size], ...style,
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(.97)'}
      onMouseUp={e   => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      {...p}
    >
      {loading && <Spinner size={13} color={variant === 'primary' ? '#fff' : 'var(--accent)'} />}
      {children}
    </button>
  )
}

/* ── Input ────────────────────────────────────────────────────────────────── */
export function Input({ label, error, hint, style={}, ...p }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
      {label && <label style={{ fontSize:'12px', fontWeight:500, color:'var(--text2)', letterSpacing:'.02em', textTransform:'uppercase' }}>{label}</label>}
      <input
        style={{
          width:'100%', padding:'11px 14px', outline:'none', fontFamily:'inherit',
          background:'rgba(255,255,255,0.03)', border:`1px solid ${error ? 'var(--red)' : 'var(--border2)'}`,
          borderRadius:'var(--r-sm)', color:'var(--text)', fontSize:'14px',
          transition:'border-color .15s', ...style,
        }}
        onFocus={e  => e.target.style.borderColor = error ? 'var(--red)' : 'var(--accent)'}
        onBlur={e   => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border2)'}
        {...p}
      />
      {error && <span style={{ fontSize:'12px', color:'var(--red)' }}>{error}</span>}
      {hint  && !error && <span style={{ fontSize:'12px', color:'var(--text3)' }}>{hint}</span>}
    </div>
  )
}

/* ── Badge ────────────────────────────────────────────────────────────────── */
const STATUS = {
  done:      { bg:'rgba(47,212,146,.1)',  color:'#2fd492', label:'Done' },
  analyzing: { bg:'rgba(75,131,240,.1)',  color:'#4b83f0', label:'Analyzing' },
  pending:   { bg:'rgba(245,185,66,.1)',  color:'#f5b942', label:'Pending' },
  failed:    { bg:'rgba(240,100,100,.1)', color:'#f06464', label:'Failed' },
}
export function Badge({ status }) {
  const s = STATUS[status] || STATUS.pending
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 9px',
      borderRadius:'99px', background:s.bg, color:s.color, fontSize:'11px', fontWeight:500, letterSpacing:'.02em',
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.color, flexShrink:0,
        animation: status === 'analyzing' ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
      {s.label}
    </span>
  )
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
export function Card({ children, onClick, style={} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background:'var(--bg2)', border:'1px solid var(--border)',
        borderRadius:'var(--r-lg)', padding:'20px',
        cursor: onClick ? 'pointer' : 'default',
        transition:'border-color .15s, transform .15s', ...style,
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.transform='translateY(-2px)' } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor='var(--border)';  e.currentTarget.style.transform='translateY(0)' } }}
    >
      {children}
    </div>
  )
}

/* ── EmptyState ───────────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', padding:'64px 24px', color:'var(--text3)' }}>
      <div style={{ fontSize:'38px', opacity:.5 }}>{icon}</div>
      <p style={{ fontSize:'15px', color:'var(--text2)', fontWeight:500 }}>{title}</p>
      {subtitle && <p style={{ fontSize:'13px', color:'var(--text3)', textAlign:'center', maxWidth:'280px', lineHeight:1.6 }}>{subtitle}</p>}
      {action && <div style={{ marginTop:'4px' }}>{action}</div>}
    </div>
  )
}

/* ── Alert ────────────────────────────────────────────────────────────────── */
export function Alert({ type='error', children }) {
  const map = {
    error: { bg:'rgba(240,100,100,.08)', border:'rgba(240,100,100,.2)', color:'var(--red)' },
    info:  { bg:'rgba(75,131,240,.08)',  border:'rgba(75,131,240,.2)',  color:'var(--accent)' },
    success:{ bg:'rgba(47,212,146,.08)', border:'rgba(47,212,146,.2)',  color:'var(--green)' },
  }
  const s = map[type]
  return (
    <div style={{ padding:'10px 14px', borderRadius:'var(--r-sm)', fontSize:'13px', lineHeight:1.6,
      background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>
      {children}
    </div>
  )
}
