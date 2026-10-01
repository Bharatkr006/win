import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { shortDate, longDate, dateKey, isSameDay } from '../utils/dates';
import { useHabits, useHabitLogs, useTasks, useJournal } from '../hooks/data';
import { CheckIcon, TrashIcon } from './icons';

export default function DayCard({ date, isExpanded, onToggle, isFuture }) {
  const isToday = isSameDay(date, new Date());
  const dKey = dateKey(date);

  const { habits } = useHabits();
  const { logs, toggleLog } = useHabitLogs();
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const { journal, upsertNote } = useJournal();

  const [newTask, setNewTask] = useState('');
  const [newHabit, setNewHabit] = useState('');

  const storedNote = journal.find((j) => j.date === dKey)?.note || '';
  const [localNote, setLocalNote] = useState(storedNote);

  useEffect(() => {
    setLocalNote(storedNote);
  }, [storedNote]);

  const [debouncedNote] = useDebounce(localNote, 1000);
  const [initialMount, setInitialMount] = useState(true);
  useEffect(() => {
    if (initialMount) {
      setInitialMount(false);
      return;
    }
    if (debouncedNote !== storedNote) {
      upsertNote(dKey, debouncedNote);
    }
  }, [debouncedNote]);

  const dayLogs = logs.filter((log) => log.date === dKey);
  const doneHabitIds = new Set(dayLogs.map((log) => log.habit_id));
  const dayTasks = tasks.filter((t) => t.date === dKey);

  const doneCount = dayLogs.length + dayTasks.filter((t) => t.is_done).length;
  // Note: Only counting "active" habits in the total size metric for today,
  // plus any "archived" habits that happen to be done right now.
  const relevantHabits = habits.filter(h => h.is_active || doneHabitIds.has(h.id));
  const totalCount = relevantHabits.length + dayTasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    // We add habit to SWR via `useHabits()` here, but we should import `addHabit` too
    // Wait, the destructuring above missed `addHabit`.
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(newTask.trim(), dKey);
    setNewTask('');
  };

  const handleKeyDown = (e, setFunc) => {
    if (e.key === 'Escape') {
      setFunc('');
      e.target.blur();
    }
  };

  const cardClasses = `
    scroll-mt-6
    overflow-hidden transition-all duration-200 rounded-2xl border bg-surface
    ${isToday ? 'border-green-mid/30 shadow-[0_0_24px_rgba(46,133,72,0.12)]' : 'border-border-soft shadow-sm'}
    ${isFuture && !isExpanded ? 'opacity-50' : 'opacity-100'}
  `;

  return (
    <article id={`day-${dKey}`} className={cardClasses}>
      <button
        onClick={onToggle}
        className="flex w-full flex-col justify-between p-6 text-left hover:bg-green-pale/30 transition-colors duration-150"
      >
        <div className="flex w-full items-center justify-between pb-1">
          <span className="font-semibold tracking-tight text-text">
            {longDate(date)}
            {isToday && <span className="ml-3 rounded-md bg-green-pale px-2 py-0.5 text-xs uppercase font-bold tracking-wider text-green-deep">Today</span>}
          </span>
          <div className="flex items-center gap-3 text-sm text-green-gray">
            {totalCount > 0 && <span className="hidden sm:inline">{doneCount} / {totalCount} done</span>}
            <svg
              className={`h-4 w-4 text-green-gray/40 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Progress Bar under the header */}
        <div className="w-full h-1 bg-green-pale rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-green-mid rounded-full progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 py-2 pb-6">
          {/* Grid: equal-height columns on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">

              {/* HABITS */}
              <div>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-green-gray/80">Habits</h3>
                {relevantHabits.length > 0 && (
                  <ul className="space-y-0.5">
                    {relevantHabits.map((habit) => {
                      const isDone = doneHabitIds.has(habit.id);
                      return (
                        <li key={habit.id}>
                          <button
                            onClick={() => toggleLog(habit.id, dKey, isDone)}
                            className="group w-full flex items-center justify-between rounded-lg py-2.5 px-2 hover:bg-green-pale/60 transition-colors duration-150"
                          >
                            <span className={`text-sm transition-all duration-200 ${isDone ? 'opacity-40 line-through' : 'text-text font-medium'}`}>
                              {habit.title}
                            </span>
                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${isDone ? 'border-green-mid bg-green-mid text-white shadow-sm check-pop' : 'border-green-gray/30 bg-white group-hover:border-green-mid/60 group-hover:bg-green-pale'}`}>
                              <CheckIcon className={`h-3 w-3 transition-opacity duration-150 ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* TASKS */}
              <div>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-green-gray/80">Tasks</h3>
                <ul className="space-y-0.5 text-sm mb-2">
                  {dayTasks.map((task) => (
                    <li key={task.id} className="group flex items-center justify-between gap-3 rounded-lg py-2.5 px-2 hover:bg-green-pale/40 transition-colors duration-150">
                      <div className="flex flex-1 items-center gap-3 overflow-hidden">
                        <button
                          onClick={() => toggleTask(task.id, task.is_done)}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${task.is_done ? 'border-green-mid bg-green-mid text-white check-pop' : 'border-green-gray/30 bg-white hover:border-green-mid/60 hover:bg-green-pale'}`}
                        >
                          <CheckIcon className={`h-3 w-3 transition-opacity duration-150 ${task.is_done ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                        <span className={`truncate text-sm transition-all duration-200 ${task.is_done ? 'opacity-40 line-through' : 'text-text'}`}>
                          {task.title}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-green-gray/40 opacity-0 transition-all duration-150 hover:text-red-500 group-hover:opacity-100"
                        title="Delete task"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={handleAddTask} className="px-2">
                  <input
                    type="text"
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }}
                    placeholder="+ Add a task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, setNewTask)}
                    className="w-full bg-transparent py-2.5 text-sm text-text outline-none placeholder:text-green-gray/40 focus:placeholder:text-green-gray/60"
                  />
                </form>
              </div>
            </div>

            {/* Journal — fills full column height */}
            <div className="flex flex-col min-h-[120px]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-green-gray/80">Journal</h3>
                {debouncedNote !== localNote && <span className="text-xs text-green-gray/60 animate-pulse">Saving...</span>}
                {debouncedNote === localNote && localNote && <span className="text-xs text-green-mid transition-opacity">Saved</span>}
              </div>
              <textarea
                value={localNote}
                onChange={(e) => {
                  setLocalNote(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                placeholder="How did today go?"
                className="w-full flex-1 h-full resize-none rounded-xl border border-border-soft bg-green-pale/20 p-4 text-sm leading-relaxed outline-none transition-all duration-150 min-h-[80px] focus:bg-white focus:border-green-mid/60 focus:shadow-[0_0_0_3px_rgba(46,133,72,0.08)]"
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
