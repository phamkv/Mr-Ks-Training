import { useEffect, useRef, useState } from 'react';
import { GameFrame } from '../components/GameFrame';
import type { GameModule, GameState, RoundOutcome } from '../core/game';
import { buildResult, RoundClock } from '../core/round';
import { nextGameId, type TodaysSet } from '../core/setGenerator';
import { useLanguage, useT } from '../i18n';
import { getGameState, getSettings, saveFinishedRound, updateSettings } from '../storage/store';
import { requestSync } from '../sync/client';

const E2E_ROUND_MS = 3_000;

interface SetRunnerProps {
  games: readonly GameModule[];
  set: TodaysSet;
  onBack(finishedIndex: number | null): void;
}

type View = 'loading' | 'intro' | 'demo' | 'play';

export function SetRunner({ games, set, onBack }: SetRunnerProps) {
  const t = useT();
  const language = useLanguage();
  const gameId = nextGameId(set);
  const game = games.find((candidate) => candidate.id === gameId);
  const index = gameId ? set.gameIds.indexOf(gameId) : -1;
  const [view, setView] = useState<View>('loading');
  const [state, setState] = useState<GameState | null>(null);
  const [leaving, setLeaving] = useState(false);
  const clockRef = useRef<RoundClock | null>(null);

  useEffect(() => {
    if (!game) {
      onBack(null);
      return;
    }
    void (async () => {
      const [saved, settings] = await Promise.all([getGameState(game), getSettings()]);
      setState(saved);
      setView(settings.seenDemos.includes(game.id) ? 'intro' : 'demo');
    })();
  }, [game, onBack]);

  useEffect(() => {
    if (view !== 'play') return;
    const onVisibility = () => {
      if (document.hidden) clockRef.current?.pause();
      else if (!leaving) clockRef.current?.resume();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [view, leaving]);

  if (!game || !state || view === 'loading') return <div className="screen" />;

  const frame = { progress: t('gameOf', { n: index + 1, total: set.gameIds.length }), title: game.messages[language].title };
  const backButton = (
    <button type="button" className="btn-small" onClick={() => onBack(null)}>{t('backToSet')}</button>
  );

  async function demoSeen() {
    const settings = await getSettings();
    if (!settings.seenDemos.includes(game!.id)) {
      await updateSettings({ seenDemos: [...settings.seenDemos, game!.id] });
    }
    startPlaying();
  }

  function startPlaying() {
    clockRef.current = new RoundClock();
    setView('play');
  }

  async function finish(outcome: RoundOutcome) {
    const clock = clockRef.current!;
    clock.pause();
    const result = buildResult(game!.id, outcome, clock, language, __APP_VERSION__);
    await saveFinishedRound(result, outcome.nextState, set);
    if (typeof outcome.meta.frameMs === 'number') await updateSettings({ lastFrameMs: outcome.meta.frameMs });
    requestSync();
    onBack(index);
  }

  if (view === 'demo') {
    return (
      <GameFrame {...frame} action={backButton}>
        <game.Demo language={language} onDone={() => void demoSeen()} />
      </GameFrame>
    );
  }

  if (view === 'intro') {
    return (
      <GameFrame {...frame} action={backButton}>
        <div className="message-screen">
          <div>
            <h1 className="panel-title">{game.messages[language].title}</h1>
            <p className="panel-text">{game.messages[language].instructions}</p>
          </div>
          <div className="stack">
            <button type="button" className="btn btn-primary" onClick={startPlaying}>{t('startGame')}</button>
            <button type="button" className="btn btn-secondary" onClick={() => setView('demo')}>{t('showMe')}</button>
          </div>
        </div>
      </GameFrame>
    );
  }

  const leaveButton = (
    <button
      type="button"
      className="btn-small"
      onClick={() => {
        clockRef.current?.pause();
        setLeaving(true);
      }}
    >
      {t('leaveThisGame')}
    </button>
  );

  return (
    <>
      <GameFrame {...frame} action={leaveButton}>
        <game.Game
          state={state}
          targetMs={import.meta.env.VITE_E2E ? E2E_ROUND_MS : game.targetMs}
          language={language}
          clock={clockRef.current!}
          paused={leaving}
          onFinish={(outcome) => void finish(outcome)}
        />
      </GameFrame>
      {leaving && (
        <div className="screen leave" role="alertdialog" aria-labelledby="leave-title" aria-describedby="leave-body">
          <div className="panel leave-panel">
            <h1 className="panel-title" id="leave-title">{t('leaveTitle')}</h1>
            <p className="panel-text" id="leave-body">{t('leaveBody')}</p>
            <div className="stack leave-actions">
              <button
                type="button"
                className="btn btn-primary btn-large"
                autoFocus
                onClick={() => {
                  clockRef.current?.resume();
                  setLeaving(false);
                }}
              >
                {t('keepPlaying')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onBack(null)}>{t('leaveConfirm')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
