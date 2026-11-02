export function ArrowIcon({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
      <path d="M44 24 28 8v10H4v12h24v10z" />
    </svg>
  );
}

export function SettingsIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 6.700h18v2.600H3zM3 14.700h18v2.600H3z" />
      <circle cx="8.500" cy="8" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

export function CheckIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 25l11 11L40 13" />
    </svg>
  );
}

export function CrossIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" aria-hidden="true">
      <path d="M12 12l24 24M36 12L12 36" />
    </svg>
  );
}
