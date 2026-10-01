import { useState, useEffect } from 'react';
import DayCard from './DayCard';
import { getArcDays, dateKey, isSameDay, isSameWeek } from '../utils/dates';
import { useHabits } from '../hooks/data';

export default function DailyList() {
  const days = getArcDays();
  const todayDate = new Date();
  const todayDateObj = days.find(d => isSameDay(d.date, todayDate))?.date || days[days.length - 1].date;

  const [activeTab, setActiveTab] = useState('Today'); // 'Today' | 'Week' | 'All'
  const [expandedKey, setExpandedKey] = useState(dateKey(todayDateObj));

  const { habits, seedHabits, isLoading } = useHabits();

  // Auto-seed explicitly from empty state right below tabs
  useEffect(() => {
    // Only auto-seed if we are sure there are absolutely no habits
    if (!isLoading && habits.length === 0) {
      const seeded = localStorage.getItem('has_seeded');
      if (!seeded) {
        localStorage.setItem('has_seeded', 'true');
        seedHabits();
      }
    }
  }, [isLoading, habits.length, seedHabits]);

  // Scroll to today on mount
  useEffect(() => {
    if (activeTab !== 'All') return;
    const todayElement = document.getElementById(`day-${dateKey(todayDateObj)}`);
    if (todayElement) {
      setTimeout(() => {
        todayElement.scrollIntoView({ behavior: 'start', block: 'start' });
        window.scrollBy(0, -20);
      }, 100);
    }
  }, [activeTab]);

  const filteredDays = days.filter(({ date }) => {
    if (activeTab === 'Today') return isSameDay(date, todayDateObj);
    if (activeTab === 'Week') return isSameWeek(date, todayDateObj);
    return true; // All
  });

  return (
    <div className="flex flex-col flex-1 mt-4 lg:mt-0">
      <div className="flex bg-green-pale/40 p-1 rounded-xl w-[calc(100%-2rem)] sm:w-full sm:max-w-xs mb-6 mx-4 sm:mx-0">
        {['Today', 'Week', 'All'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'Today') setExpandedKey(dateKey(todayDateObj));
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
              activeTab === tab
                ? 'bg-white text-text shadow-sm'
                : 'text-green-gray hover:text-text hover:bg-white/40'
            }`}
          >
            {tab === 'Week' ? 'This week' : tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4 sm:px-0">
        {filteredDays.map(({ date }) => {
          const dKey = dateKey(date);
          const isFuture = date > todayDateObj && !isSameDay(date, todayDateObj);

          return (
            <DayCard
              key={dKey}
              date={date}
              isFuture={isFuture}
              isExpanded={activeTab === 'Today' || expandedKey === dKey}
              onToggle={() => setExpandedKey(expandedKey === dKey ? null : dKey)}
            />
          );
        })}
      </div>
    </div>
  );
}
