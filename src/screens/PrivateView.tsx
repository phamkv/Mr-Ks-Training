import { useEffect, useMemo, useState } from 'react';
import { languages, localeOf, preferredLanguage } from '../core/language';
import { games } from '../core/registry';
import { LanguageProvider, translate } from '../i18n';
import { mondayOf } from '../core/week';
import { localDate } from '../core/round';

const SPEED_GOAL_HOURS = 10;

interface ViewData {
  lastSyncAt: string | null;
  daysPerWeek: number;
  totals: { gameId: string; totalMs: number }[];
  weeks: { weekStart: string; days: number; minutes: number }[];
  trends: { gameId: string; date: string; stage: number; score: number; rounds: number }[];
}

type Load = { kind: 'loading' } | { kind: 'denied' } | { kind: 'offline' } | { kind: 'ready'; data: ViewData };

// One viewBox unit is about one CSS pixel on a phone, so chart labels stay at the 20 px minimum.
const W = 360;
const H = 190;
const PAD = { left: 62, right: 12, top: 14, bottom: 34 };

function Trend({ points, unit, format }: { points: { date: string; score: number }[]; unit: string; format(date: string): string }) {
  const [active, setActive] = useState<number | null>(null);
  const scores = points.map((point) => point.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const span = max - min || Math.max(1, Math.abs(max) * 0.1);
  const x = (i: number) => PAD.left + (points.length === 1 ? (W - PAD.left - PAD.right) / 2 : (i / (points.length - 1)) * (W - PAD.left - PAD.right));
  const y = (score: number) => PAD.top + (1 - (score - min) / span) * (H - PAD.top - PAD.bottom);
  const line = points.map((point, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(point.score).toFixed(1)}`).join(' ');
  const shown = active ?? points.length - 1;
  const value = (score: number) => `${Math.round(score * 10) / 10}${unit}`;

  return (
    <>
      <p className="chart-readout" aria-live="polite">{format(points[shown].date)}: {value(points[shown].score)}</p>
      <svg
        className="chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${format(points[0].date)}: ${value(points[0].score)}. ${format(points[points.length - 1].date)}: ${value(points[points.length - 1].score)}.`}
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const px = ((event.clientX - box.left) / box.width) * W;
          const step = points.length > 1 ? (W - PAD.left - PAD.right) / (points.length - 1) : 1;
          setActive(Math.max(0, Math.min(points.length - 1, Math.round((px - PAD.left) / step))));
        }}
        onPointerLeave={() => setActive(null)}
      >
        <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="#E9EDF2" strokeWidth="2" />
        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top} y2={PAD.top} stroke="#E9EDF2" strokeWidth="2" />
        <text x={PAD.left - 8} y={PAD.top + 7} textAnchor="end">{Math.round(max)}</text>
        <text x={PAD.left - 8} y={H - PAD.bottom + 7} textAnchor="end">{Math.round(min)}</text>
        <text x={PAD.left} y={H - 8}>{format(points[0].date)}</text>
        {points.length > 1 && <text x={W - PAD.right} y={H - 8} textAnchor="end">{format(points[points.length - 1].date)}</text>}
        {points.length > 1 && <path d={line} fill="none" stroke="#0E1B2C" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        <line x1={x(shown)} x2={x(shown)} y1={PAD.top} y2={H - PAD.bottom} stroke="#33445A" strokeWidth="1" strokeDasharray="3 4" />
        <circle cx={x(shown)} cy={y(points[shown].score)} r="6" fill="#0E1B2C" stroke="#FFFFFF" strokeWidth="2" />
      </svg>
    </>
  );
}

export function PrivateView() {
  const language = useMemo(() => preferredLanguage(navigator.languages?.find((code) => languages.some((l) => code.startsWith(l.id))) ?? 'en'), []);
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) => translate(language, key, params);

  useEffect(() => {
    document.documentElement.lang = language;
    const token = window.location.hash.slice(1);
    if (!token) {
      setLoad({ kind: 'denied' });
      return;
    }
    fetch('/api/view', { headers: { authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (response.status === 401) setLoad({ kind: 'denied' });
        else if (!response.ok) setLoad({ kind: 'offline' });
        else setLoad({ kind: 'ready', data: await response.json() });
      })
      .catch(() => setLoad({ kind: 'offline' }));
  }, [language]);

  const locale = localeOf(language);
  const shortDate = (date: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric' }).format(new Date(`${date}T12:00:00`));
  const when = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

  let body;
  if (load.kind !== 'ready') {
    const text = load.kind === 'loading' ? t('viewLoading') : load.kind === 'denied' ? t('viewError') : t('viewOffline');
    body = <main className="panel"><p className="view-message" role={load.kind === 'loading' ? 'status' : 'alert'}>{text}</p></main>;
  } else {
    const { data } = load;
    const thisWeek = data.weeks.find((week) => week.weekStart === mondayOf(localDate()));
    const core = games.filter((game) => game.role === 'core');
    const shownIds = [...new Set(data.trends.map((trend) => trend.gameId))];
    const ordered = [...games.filter((game) => shownIds.includes(game.id)).map((game) => game.id), ...shownIds.filter((id) => !games.some((game) => game.id === id))];
    body = (
      <>
        <header className="view-head">
          <h1 className="view-title">{t('viewTitle')}</h1>
          <p className="view-meta">{data.lastSyncAt ? t('viewLastSync', { when: when(data.lastSyncAt) }) : t('viewNoSync')}</p>
        </header>
        <main className="panel view-panel">
          <div className="view-week">
            {core.map((game) => {
              const ms = data.totals.find((total) => total.gameId === game.id)?.totalMs ?? 0;
              const hours = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(ms / 3_600_000);
              return <p key={game.id}>{t('viewHours', { game: game.messages[language].title, hours, goal: SPEED_GOAL_HOURS })}</p>;
            })}
            <p>{t('viewWeek', { n: thisWeek?.days ?? 0, target: data.daysPerWeek })}{thisWeek && thisWeek.minutes > 0 ? ` · ${translate(language, 'weekMinutes', { n: thisWeek.minutes })}` : ''}</p>
          </div>
          {ordered.length === 0 && <p className="panel-text">{t('viewEmpty')}</p>}
          {ordered.flatMap((id) => {
            const game = games.find((candidate) => candidate.id === id);
            const stages = [...new Set(data.trends.filter((trend) => trend.gameId === id).map((trend) => trend.stage))].sort((a, b) => a - b);
            const unit = game?.scoreUnit === 'ms' ? ' ms' : '';
            return stages.map((stage) => {
              const points = data.trends.filter((trend) => trend.gameId === id && trend.stage === stage);
              return (
                <section className="view-chart" key={`${id}-${stage}`}>
                  <h2>{game?.messages[language].title ?? id}{stages.length > 1 ? ` · ${t('viewStage', { n: stage })}` : ''}</h2>
                  {game && (
                    <p className="chart-sub">
                      {game.messages[language].scoreLabel} · {game.scoreDirection === 'lower-better' ? t('viewLower') : t('viewHigher')}
                    </p>
                  )}
                  <Trend points={points} unit={unit} format={shortDate} />
                  <details>
                    <summary>{t('viewTable')}</summary>
                    <table>
                      <thead><tr><th>{t('viewDate')}</th><th>{t('viewScore')}</th></tr></thead>
                      <tbody>
                        {points.map((point) => (
                          <tr key={point.date}><td>{shortDate(point.date)}</td><td>{Math.round(point.score * 10) / 10}{unit}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                </section>
              );
            });
          })}
          <p className="view-notice">{t('viewNotice')}</p>
        </main>
      </>
    );
  }

  return (
    <LanguageProvider language={language}>
      <div className="screen view">{body}</div>
    </LanguageProvider>
  );
}
