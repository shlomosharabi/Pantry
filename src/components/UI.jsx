// ─── Shared small components ────────────────────────────────────────────────

export function Badge({ children, variant = 'default' }) {
  const cls = {
    default: 'bg-mist-200/10 text-mist-300',
    warn:    'bg-amber-500/15 text-amber-400',
    danger:  'bg-rose-500/15 text-rose-400',
    ok:      'bg-jade-500/15 text-jade-400',
  }
  return (
    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${cls[variant]}`}>
      {children}
    </span>
  )
}

export function IconBtn({ onClick, title, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg text-mist-400/50 hover:text-mist-300 hover:bg-white/5 transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-mist-100
        placeholder:text-mist-400/40 focus:outline-none focus:border-mist-400/50 focus:ring-1 focus:ring-mist-400/30
        transition-all w-full ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`bg-ink-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-mist-300
        focus:outline-none focus:border-mist-400/50 focus:ring-1 focus:ring-mist-400/30 transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Btn({ children, variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-40'
  const variants = {
    primary: 'bg-mist-500 hover:bg-mist-400 text-white',
    ghost:   'bg-white/5 hover:bg-white/10 text-mist-300',
    danger:  'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400',
    jade:    'bg-jade-500/20 hover:bg-jade-500/30 text-jade-400',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// Chevron icons as inline SVG to avoid icon library dep
export const Icons = {
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  MoveUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}
