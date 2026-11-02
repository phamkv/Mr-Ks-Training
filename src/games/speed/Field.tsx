import { forwardRef, type ReactNode } from 'react';
import type { SpeedTrial, Vehicle } from './logic';
import { OUTER_POSITIONS } from './logic';

export function VehicleIcon({ vehicle }: { vehicle: Vehicle }) {
  return vehicle === 'car' ? (
    <svg viewBox="0 0 64 36" fill="currentColor" aria-hidden="true">
      <path d="M2 26v-7l8-3 8-11c1-1 2-2 4-2h19c2 0 3 1 4 2l9 11 6 3c1 0 2 2 2 3v4h-6a7 7 0 0 0-14 0H22a7 7 0 0 0-14 0zm20-19-7 9h13V7zm10 0v9h14l-8-9z" />
      <circle cx="15" cy="27" r="6" />
      <circle cx="49" cy="27" r="6" />
    </svg>
  ) : (
    <svg viewBox="0 0 64 36" fill="currentColor" aria-hidden="true">
      <path d="M2 3h36v23H24a7 7 0 0 0-14 0H2zM41 10h11l10 10v6h-4a7 7 0 0 0-14 0h-3z" />
      <circle cx="17" cy="28" r="6" />
      <circle cx="51" cy="28" r="6" />
    </svg>
  );
}

export function positionStyle(index: number) {
  const angle = (index / OUTER_POSITIONS) * 2 * Math.PI - Math.PI / 2;
  return { left: `${50 + 37 * Math.cos(angle)}%`, top: `${50 + 37 * Math.sin(angle)}%` };
}

// All stimuli stay in the DOM and flash timing only toggles an attribute, so React rendering can't
// affect how long they show.
export const Field = forwardRef<HTMLDivElement, { trial: SpeedTrial | null; showCross?: boolean; view?: string; children?: ReactNode }>(
  function Field({ trial, showCross = false, view, children }, ref) {
    return (
      <div className="field" ref={ref} data-view={view}>
        {showCross && <div className="cross" />}
        {trial && (
          <>
            <div className="stim centre"><VehicleIcon vehicle={trial.centre} /></div>
            <div className="stim outer" style={positionStyle(trial.outer)}><VehicleIcon vehicle="car" /></div>
            {trial.distractors.map((position) => (
              <div className="stim outer" key={position} style={positionStyle(position)}>
                <svg viewBox="0 0 48 44" fill="none" stroke="currentColor" strokeWidth="5" aria-hidden="true"><path d="M24 5 44 40H4z" /></svg>
              </div>
            ))}
          </>
        )}
        <div className="mask" />
        {children}
      </div>
    );
  },
);
