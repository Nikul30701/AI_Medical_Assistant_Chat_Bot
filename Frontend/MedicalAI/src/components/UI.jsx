
export function Spinner({ size = 20, className = "" }) {
  return (
    <svg 
      className={`animate-spin ${className}`} 
      style={{ width: size, height: size }}
      viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
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
const variants = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm border-transparent",
  ghost: "bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 shadow-sm",
  danger: "bg-white text-red-600 border-red-100 hover:bg-red-50",
  subtle: "bg-transparent text-zinc-500 hover:text-zinc-900 border-transparent",
};

const sizes = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3.5 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-lg font-semibold",
  lg: "px-7 py-3.5 text-base rounded-xl font-semibold",
};

export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  return (
    <button
      disabled={props.disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 transition-all duration-150
        border active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none
        focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && <Spinner size={14} className={variant === 'primary' ? 'text-white' : 'text-zinc-900'} />}
      {children}
    </button>
  );
}

/* ── Input ────────────────────────────────────────────────────────────────── */
export function Input({ label, error, hint, className = '', rightElement, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-zinc-900 uppercase tracking-tight ml-0.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          className={`
            w-full px-4 py-2.5 bg-white text-sm text-zinc-900 rounded-lg border
            transition-all duration-200 placeholder:text-zinc-400
            focus:outline-none focus:ring-4 focus:ring-zinc-900/5
            ${error ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900'}
            ${rightElement ? 'pr-11' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 focus-within:z-10">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-xs font-medium text-red-500 ml-0.5">{error}</span>}
      {hint && !error && <span className="text-xs text-zinc-400 ml-0.5">{hint}</span>}
    </div>
  );
}

/* ── Badge ────────────────────────────────────────────────────────────────── */
const badgeStyles = {
  done: "bg-emerald-50 text-emerald-700 border-emerald-100",
  analyzing: "bg-blue-50 text-blue-700 border-blue-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  failed: "bg-red-50 text-red-700 border-red-100",
};

export function Badge({ status }) {
  const style = badgeStyles[status] || badgeStyles.pending;
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${status === 'analyzing' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
export function Card({ children, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white border border-zinc-100 p-6 rounded-2xl transition-all duration-300
        ${onClick ? 'cursor-pointer hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* ── EmptyState ───────────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="text-5xl mb-4 grayscale opacity-60">{icon}</div>
      <h3 className="text-lg font-bold text-zinc-900 tracking-tight">{title}</h3>
      {subtitle && <p className="text-sm text-zinc-500 mt-1 max-w-xs leading-relaxed">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Alert({ type = 'error', children, className = '' }) {
  const styles = {
    error: "bg-red-50 border-red-100 text-red-700",
    info: "bg-blue-50 border-blue-100 text-blue-700",
    success: "bg-emerald-50 border-emerald-100 text-emerald-700",
  };

  return (
    <div className={`p-4 rounded-xl border text-sm font-medium leading-relaxed ${styles[type]} ${className}`}>
      {children}
    </div>
  );
}
