import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowIcon, CheckIcon, SettingsIcon } from '../components/icons';
import { UpdatePrompt } from '../components/UpdatePrompt';
import { newBests } from '../core/bests';
import type { GameModule, RoundResult } from '../core/game';
import { localeOf } from '../core/language';
import { localDate } from '../core/round';
import { nextGameId, type TodaysSet } from '../core/setGenerator';
import { weekProgress } from '../core/week';
import { useLanguage, useT } from '../i18n';
import { db } from '../storage/db';
import { ensureTodaysSet, getSettings, startAnotherSet } from '../storage/store';

interface HomeProps {
  games: readonly GameModule[];
  finishedIndex: number | null; // the row she just finished, for the amber band's move
  onUpdate: (() => void) | null; // set when a new version is ready
  onStart(set: TodaysSet): void;
  onSettings(): void;
}

interface Loaded {
  date: string;
  set: TodaysSet;
  results: RoundResult[];
  daysPerWeek: number;
}

function greetingKey(hour: number) {
  if (hour < 12) return 'greetingMorning' as const;
  if (hour < 18) return 'greetingAfternoon' as const;
  return 'greetingEvening' as const;
}

export function Home({ games, finishedIndex, onUpdate, onStart, onSettings }: HomeProps) {
  const t = useT();
  const language = useLanguage();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const legsRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const movedFrom = useRef(finishedIndex);

  const load = useCallback(async () => {
    const date = localDate();
    const [set, results, settings] = await Promise.all([ensureTodaysSet(games, date), db.results.toArray(), getSettings()]);
    setLoaded({ date, set, results, daysPerWeek: settings.daysPerWeek });
  }, [games]);

  useEffect(() => {
    void load();
    // The app can stay open overnight, so a new day brings a new pass.
    const onVisible = () => {
      if (!document.hidden) void load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const currentId = loaded ? nextGameId(loaded.set) : null;
  const currentIndex = loaded && currentId ? loaded.set.gameIds.indexOf(currentId) : -1;

  useLayoutEffect(() => {
    const legs = legsRef.current;
    const band = bandRef.current;
    if (!legs || !band) return;
    // Only the first placement after a finished game may animate, including when the set just ended.
    const from = movedFrom.current;
    if (loaded) movedFrom.current = null;
    if (currentIndex < 0) return;
    // Rows have fractional heights, and rounded offsets would leave a sliver beside the band.
    const rowTop = (row: HTMLElement) => row.getBoundingClientRect().top - legs.getBoundingClientRect().top;
    const place = () => {
      const row = legs.children[currentIndex + 1] as HTMLElement | undefined; // the band is child 0
      if (!row) return;
      // One pixel under the next row's rule, so no white line shows at 1x.
      band.style.height = `${row.getBoundingClientRect().height + (row.nextElementSibling ? 1 : 0)}px`;
      band.style.transform = `translateY(${rowTop(row)}px)`;
    };
    place();
    const fromRow = from === null ? undefined : (legs.children[from + 1] as HTMLElement | undefined);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (fromRow && !reduced && band.animate) {
      band.animate(
        [{ transform: `translateY(${rowTop(fromRow)}px)` }, { transform: band.style.transform }],
        { duration: 1000, delay: 450, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'backwards' },
      );
    }
    // Rows change height when fonts load or the window resizes, and the band has to follow.
    const observer = new ResizeObserver(place);
    observer.observe(legs);
    return () => observer.disconnect();
  }, [currentIndex, loaded?.set.setNumber]);

  if (!loaded) return <div className="screen" />;

  const { date, set, results } = loaded;
  const week = weekProgress(results, loaded.daysPerWeek, date);
  const bests = newBests(results, games, date);
  const setGames = set.gameIds.map((id) => games.find((game) => game.id === id)).filter((game) => game !== undefined);
  const remaining = setGames.filter((game) => !set.completedIds.includes(game.id));
  const remainingMinutes = Math.ceil(remaining.reduce((sum, game) => sum + game.targetMs, 0) / 60_000);
  const number = new Intl.NumberFormat(localeOf(language));
  const today = new Intl.DateTimeFormat(localeOf(language), { weekday: 'long', day: 'numeric', month: 'numeric' }).format(new Date(`${date}T12:00:00`));
  const started = set.completedIds.length > 0;
  const weekText = week.isNewWeek
    ? t('newWeek')
    : week.daysPlayed > week.target
      ? t('weekDaysPlain', { n: week.daysPlayed })
      : t('weekDays', { n: week.daysPlayed, target: week.target });

  return (
    <div className="screen home">
      <header className="home-bar">
        <h1 className="greeting">{t(greetingKey(new Date().getHours()))}</h1>
        <button type="button" className="btn-small" onClick={onSettings}>
          <SettingsIcon />
          {t('settings')}
        </button>
      </header>

      <main className="panel pass">
        <div className="pass-head">
          <h2>{t('todaysSet')}</h2>
          <span>{today}</span>
        </div>
        <div className="legs" ref={legsRef}>
          <div className="band" ref={bandRef} hidden={currentIndex < 0} />
          {setGames.map((game, index) => {
            const isDone = set.completedIds.includes(game.id);
            const isNow = game.id === currentId;
            const minutes = t('minutesShort', { n: number.format(game.targetMs / 60_000) });
            return (
              <div className="leg" key={game.id} aria-current={isNow ? 'step' : undefined}>
                <div className="leg-number">{isDone ? <CheckIcon size={46} /> : index + 1}</div>
                <div>
                  <div className="leg-name">{game.messages[language].title}</div>
                  <div className="leg-time">{isDone ? t('done') : isNow ? `${minutes} · ${t('now')}` : minutes}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="tear" />
        <div className="stub">
          {currentId ? (
            <button type="button" className="btn btn-primary btn-go" onClick={() => onStart(set)}>
              <span className="btn-go-text">
                <b>{started ? t('continue') : t('start')}</b>
                <span>{started ? t('aboutMinutesLeft', { n: remainingMinutes }) : t('aboutMinutes', { n: remainingMinutes })}</span>
              </span>
              <span className="btn-go-arrow"><ArrowIcon /></span>
            </button>
          ) : (
            <>
              <p className="done-today"><CheckIcon size={40} />{t('doneForToday')}</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => {
                  const next = await startAnotherSet(games, date);
                  setLoaded({ ...loaded, set: next });
                }}
              >
                {t('playAnother')}
              </button>
              <p className="stub-note">{t('playAnotherNote')}</p>
            </>
          )}
        </div>
      </main>

      <footer className="week">
        <div className="week-row">
          <p data-testid="week">
            {weekText}
            {week.minutes > 0 && ` · ${t('weekMinutes', { n: week.minutes })}`}
          </p>
          {onUpdate && <UpdatePrompt onUpdate={onUpdate} />}
        </div>
        {bests.length > 0 && (
          <p>{t('newBest', { game: bests.map((id) => games.find((game) => game.id === id)!.messages[language].title).join(', ') })}</p>
        )}
        </footer>
    </div>
  );
}
