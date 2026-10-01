import { useMemo, useState, useEffect } from 'react';
import { useDailyCounts } from '../hooks/data';
import { dateKey } from '../utils/dates';
import { FlameIcon, TrophyIcon, TargetIcon, CalendarIcon } from './icons';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (value === display) return;
    const step = value > display ? 1 : -1;

    const interval = setInterval(() => {
      setDisplay(prev => {
        if (prev === value) {
          clearInterval(interval);
          return prev;
        }
        return prev + step;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [value, display]);

  return <span>{display}</span>;
}

export default function StatsRow() {
  const { counts, isLoading } = useDailyCounts();

  const stats = useMemo(() => {
    let currentStreak = 0;
    let bestStreak = 0;
    let totalDone = 0;
    let daysActive = 0;

    if (!isLoading) {
      const sortedDates = Object.keys(counts)
        .filter((d) => counts[d] > 0)
        .sort();

      daysActive = sortedDates.length;

      for (const d of sortedDates) {
        totalDone += counts[d];
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = dateKey(today);

      const cursor = new Date(today);
      if (!counts[todayStr] || counts[todayStr] === 0) {
        cursor.setDate(cursor.getDate() - 1);
      }
      while (true) {
        const dStr = dateKey(cursor);
        if (counts[dStr] > 0) {
          currentStreak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }

      if (sortedDates.length > 0) {
        let tempStreak = 1;
        bestStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevStr = sortedDates[i - 1];
          const currStr = sortedDates[i];
          const prev = new Date(prevStr + 'T00:00:00');
          const curr = new Date(currStr + 'T00:00:00');
          const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
          } else {
            tempStreak = 1;
          }
        }
      }

      bestStreak = Math.max(bestStreak, currentStreak);
    }

    return { currentStreak, bestStreak, totalDone, daysActive };
  }, [counts, isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 h-full min-h-[220px]">
        <div className="animate-pulse rounded-2xl bg-surface border border-border-soft flex-1" />
        <div className="animate-pulse rounded-2xl bg-surface border border-border-soft flex-1" />
        <div className="animate-pulse rounded-2xl bg-surface border border-border-soft flex-1" />
        <div className="animate-pulse rounded-2xl bg-surface border border-border-soft flex-1" />
      </div>
    );
  }

  const items = [
    { label: 'Streak', value: stats.currentStreak, suffix: 'd', icon: FlameIcon },
    { label: 'Best', value: stats.bestStreak, suffix: 'd', icon: TrophyIcon },
    { label: 'Done', value: stats.totalDone, suffix: '', icon: TargetIcon },
    { label: 'Active Days', value: stats.daysActive, suffix: '', icon: CalendarIcon },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={i} className="flex flex-col justify-center rounded-2xl p-4 sm:p-5 border border-border-soft bg-surface transition-all duration-150 hover:shadow-md hover:border-green-mid/20 flex-1 min-h-[100px]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight sm:tracking-wide text-green-gray/80 whitespace-nowrap">
                {it.label}
              </p>
              <div className="p-1 sm:p-1.5 rounded-full bg-green-pale shrink-0">
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-green-mid opacity-90" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tighter text-text leading-none mt-1">
              <AnimatedNumber value={it.value} />
              <span className="text-xl sm:text-2xl text-green-gray/80 align-baseline">{it.suffix}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
