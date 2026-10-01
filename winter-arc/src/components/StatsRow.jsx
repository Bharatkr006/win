import { useMemo } from 'react';
import { useDailyCounts } from '../hooks/data';
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

      let tempStreak = 0;
      if (sortedDates.length > 0) {
        const firstDate = new Date(sortedDates[0]);
        const lastDate = new Date();
        lastDate.setHours(0,0,0,0);
        let cursorDate = firstDate;

        while (cursorDate <= lastDate) {
          const dateStr = cursorDate.toISOString().split('T')[0];
          if (counts[dateStr] > 0) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
            currentStreak = tempStreak;
          } else {
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            if (!isToday) {
              tempStreak = 0;
              currentStreak = 0;
            }
          }
          cursorDate.setDate(cursorDate.getDate() + 1);
        }
      }
    }

    return { currentStreak, bestStreak, totalDone, daysActive };
  }, [counts, isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
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
