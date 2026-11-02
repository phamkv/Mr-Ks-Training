import type { ReactNode } from 'react';

// The dark surround and white panel every game screen shares, so leaving the pass doesn't feel
// like going somewhere new.
export function GameFrame(props: { progress: string; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="screen game-screen">
      <header className="game-bar">
        <p className="game-label"><b>{props.title}</b><span>{props.progress}</span></p>
        {props.action}
      </header>
      <main className="panel game-panel">{props.children}</main>
    </div>
  );
}
