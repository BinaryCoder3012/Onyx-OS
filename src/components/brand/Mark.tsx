/** The Onyx mark: a cut stone seen side-on, its bands showing, one of them sard. */
export function Mark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="2" y="3" width="20" height="18" rx="3.5" fill="#1f1c19" stroke="#3b3631" />
      <path d="M2.5 8.2c4.2-1.3 8.6 1.1 19-0.6" stroke="#ede8e0" strokeWidth="1.1" />
      <path d="M2.5 12.6c5.6 1.4 10-1.5 19 0.2" stroke="#e0703f" strokeWidth="2" />
      <path d="M2.5 16.8c3.9-0.9 8.7 1 19-0.4" stroke="#ede8e0" strokeWidth="0.7" opacity="0.7" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <Mark />
      <span className="font-display text-[17px] font-semibold tracking-[-0.01em] text-chalk">Onyx OS</span>
    </span>
  );
}
