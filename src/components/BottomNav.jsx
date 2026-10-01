import { CalendarIcon, TargetIcon, FlameIcon } from './icons';

export default function BottomNav({ onOpenHabits }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border-soft flex justify-around items-center px-2 py-3 lg:hidden pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-4px_12px_-1px_rgba(0,0,0,0.04)]">
      <button
        onClick={() => scrollTo('daily-list-top')}
        className="flex flex-col items-center gap-1 text-green-gray hover:text-green-mid active:scale-95 transition-all duration-150 w-20"
      >
        <TargetIcon className="h-6 w-6" />
        <span className="text-[13px] font-medium leading-none">Today</span>
      </button>

      <button
        onClick={() => scrollTo('heatmap-section')}
        className="flex flex-col items-center gap-1 text-green-gray hover:text-green-mid active:scale-95 transition-all duration-150 w-20"
      >
        <CalendarIcon className="h-6 w-6" />
        <span className="text-[13px] font-medium leading-none">Calendar</span>
      </button>

      <button
        onClick={onOpenHabits}
        className="flex flex-col items-center gap-1 text-green-gray hover:text-green-mid active:scale-95 transition-all duration-150 w-20"
      >
        <FlameIcon className="h-6 w-6" />
        <span className="text-[13px] font-medium leading-none">Habits</span>
      </button>
    </div>
  );
}
