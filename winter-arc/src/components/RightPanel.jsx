import { useHabits, useHabitLogs, useTasks } from '../hooks/data';
import { TargetIcon } from './icons';
import { dateKey } from '../utils/dates';

export default function RightPanel() {
  const { habits } = useHabits();
  const { logs } = useHabitLogs();
  const { tasks } = useTasks();

  const todayKey = dateKey(new Date());

  const dayLogs = logs.filter(l => l.date === todayKey);
  const doneHabitIds = new Set(dayLogs.map(l => l.habit_id));
  const activeHabits = habits.filter(h => h.is_active);

  const dayTasks = tasks.filter(t => t.date === todayKey);

  const doneCount = dayLogs.length + dayTasks.filter(t => t.is_done).length;
  const totalCount = activeHabits.length + dayTasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  // Identify remaining items
  const remainingHabits = activeHabits.filter(h => !doneHabitIds.has(h.id));
  const nextTask = dayTasks.find(t => !t.is_done);

  return (
    <div className="h-full flex flex-col gap-6 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold tracking-tight text-text">Today's Focus</h3>
        <TargetIcon className="h-5 w-5 text-green-mid" />
      </div>

      <div className="flex items-center gap-6">
        {/* Simple SVG Ring */}
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
            <path
              className="text-green-pale"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-green-mid progress-fill"
              strokeWidth="3"
              strokeDasharray={`${progressPercent}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-text">{progressPercent}%</span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-text">{doneCount} <span className="text-sm font-medium text-green-gray">/ {totalCount}</span></span>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-green-gray/80 mt-1">Completed</span>
        </div>
      </div>

      {(remainingHabits.length > 0 || nextTask) && (
        <div className="mt-2 border-t border-border-soft pt-6">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-green-gray/80 mb-3">Up Next</h4>
          <ul className="space-y-2.5">
            {remainingHabits.slice(0, 3).map(h => (
              <li key={h.id} className="text-sm font-medium text-text flex items-center gap-3 rounded-lg py-1 px-1 hover:bg-green-pale/40 transition-colors duration-150">
                <span className="h-2 w-2 rounded-full bg-green-mid shrink-0" />
                <span className="truncate">{h.title}</span>
              </li>
            ))}
            {remainingHabits.length > 3 && (
              <li className="text-sm text-green-gray ml-5">+ {remainingHabits.length - 3} more habits</li>
            )}

            {nextTask && (
              <li className="text-sm font-medium text-text flex items-center gap-3 rounded-lg py-1 px-1 hover:bg-green-pale/40 transition-colors duration-150">
                <span className="h-2 w-2 rounded-full bg-green-gray/40 shrink-0" />
                <span className="truncate">{nextTask.title}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {totalCount > 0 && doneCount === totalCount && (
        <div className="mt-2 border-t border-border-soft pt-6">
          <p className="text-sm font-medium text-green-deep bg-green-pale/60 p-3 rounded-lg text-center">
            All caught up for today! 🎉
          </p>
        </div>
      )}

      {totalCount === 0 && (
        <div className="mt-2 border-t border-border-soft pt-6">
          <p className="text-sm text-green-gray">No habits or tasks defined yet. Add some to get started!</p>
        </div>
      )}
    </div>
  );
}
