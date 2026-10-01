import { useMemo } from 'react';
import { useDailyCounts } from '../hooks/data';
import { dateKey } from '../utils/dates';
import { FlameIcon, TrophyIcon, TargetIcon, CalendarIcon } from './icons';

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

      // Walk backwards from today to calculate current streak,
      // then scan all dates for best streak.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = dateKey(today);

      // Current streak: count consecutive days ending at today (or yesterday).
      const cursor = new Date(today);
      // If today has no activity yet, start checking from yesterday
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

      // Best streak: scan forward through all sorted dates.
      if (sortedDates.length > 0) {
        let tempStreak = 1;
        bestStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prev = new Date(sortedDates[i - 1] + 'T00:00:00');
          const curr = new Date(sortedDates[i] + 'T00:00:00');
          const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
          } else {
            tempStreak = 1;
          }
        }
      }

      // Current streak could be the best
      bestStreak = Math.max(bestStreak, currentStreak);
    }

    return { currentStreak, bestStreak, totalDone, daysActive };
  }, [counts, isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="h-24 animate-pulse rounded-2xl bg-surface border border-border-soft" />
        <div className="h-24 animate-pulse rounded-2xl bg-surface border border-border-soft" />
        <div className="h-24 animate-pulse rounded-2xl bg-surface border border-border-soft" />
        <div className="h-24 animate-pulse rounded-2xl bg-surface border border-border-soft" />
      </div>
    );
  }

  const items = [
    { label: 'Current Streak', value: `${stats.currentStreak} d`, icon: FlameIcon },
    { label: 'Best Streak', value: `${stats.bestStreak} d`, icon: TrophyIcon },
    { label: 'Total Done', value: stats.totalDone, icon: TargetIcon },
    { label: 'Days Active', value: stats.daysActive, icon: CalendarIcon },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={i} className="flex flex-col justify-center rounded-2xl p-6 border border-border-soft bg-surface transition-all duration-150 hover:shadow-md hover:border-green-mid/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-green-gray/80">
                {it.label}
              </p>
              <Icon className="h-4 w-4 text-green-mid opacity-70" />
            </div>
            <p className="text-3xl font-bold tracking-tighter text-text">{it.value}</p>
          </div>
        );
      })}
    </div>
  );
}
