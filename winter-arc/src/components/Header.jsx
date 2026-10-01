import { getElapsedArcDays, TOTAL_DAYS } from '../utils/dates';

export default function Header({ email, onSignOut, onOpenManage }) {
  const elapsed = getElapsedArcDays();
  const progressPercent = Math.round((elapsed / TOTAL_DAYS) * 100);

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between border-b border-border-soft pb-6">
      <div className="flex flex-col gap-1 w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tighter text-text">Winter Arc</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-green-gray">
            Day {elapsed} of {TOTAL_DAYS}
          </span>
          <div className="relative h-1.5 flex-1 rounded-full bg-green-pale overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-green-mid rounded-full progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center sm:items-baseline justify-between sm:justify-end gap-4 w-full sm:w-auto">
        <span className="text-sm text-green-gray md:inline hidden">{email}</span>
        {email && (
          <div className="flex gap-4">
            <button
              onClick={onOpenManage}
              className="text-sm font-medium text-text hover:text-green-mid transition-colors duration-150"
            >
              Habits
            </button>
            <button
              onClick={onSignOut}
              className="text-sm text-green-gray hover:text-green-mid transition-colors duration-150"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
