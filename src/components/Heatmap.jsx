import { getGridSlots, dateKey, isSameDay } from '../utils/dates';
import { useDailyCounts } from '../hooks/data';
import { useState } from 'react';

const HEAT_COLORS = [
  'bg-heat-empty', // 0
  'bg-heat-1',     // 1
  'bg-heat-2',     // 2-3
  'bg-heat-3',     // 4-5
  'bg-heat-4',     // 6+
];

function getHeatLevel(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export default function Heatmap() {
  const slots = getGridSlots(); // 1D array of 98 items (14 cols x 7 rows)
  const { counts, isLoading } = useDailyCounts();
  const today = new Date();

  const [hoveredCell, setHoveredCell] = useState(null);

  // Month labels
  const monthLabels = [];
  let currentMonth = -1;
  for (let col = 0; col < 14; col++) {
    let foundMonth = -1;
    for (let row = 0; row < 7; row++) {
      const idx = col * 7 + row;
      if (slots[idx] !== null) {
        foundMonth = slots[idx].date.getMonth();
        break;
      }
    }
    if (foundMonth !== -1 && foundMonth !== currentMonth) {
      const triggerSlot = slots.slice(col * 7, col * 7 + 7).find(s => s !== null);
      if (triggerSlot) {
        monthLabels.push({
          label: triggerSlot.date.toLocaleString('en-US', { month: 'short' }),
          colIndex: col,
        });
        currentMonth = foundMonth;
      }
    }
  }

  const handleMouseEnter = (e, text) => {
    const rect = e.target.getBoundingClientRect();
    setHoveredCell({
      text,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => setHoveredCell(null);

  const scrollToDaily = (dateStr) => {
    const element = document.getElementById(`day-${dateStr}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border-soft bg-surface p-4 sm:p-6 shadow-sm overflow-x-auto">
      <h2 className="text-[13px] sm:text-sm font-bold tracking-tight text-text mb-4 lg:mb-6">Activity</h2>

      <div className="flex flex-col min-w-max">
        {/* Month labels */}
        <div className="relative h-5 text-[11px] text-green-gray font-medium tracking-wide ml-[28px] mb-1">
          {monthLabels.map(({ label, colIndex }) => (
            <span
              key={`${label}-${colIndex}`}
              className="absolute top-0"
              style={{ left: `${colIndex * 28}px` }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col gap-[4px] pr-2 pt-[2px] text-[10px] text-green-gray font-medium w-7">
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
              <span key={i} className="h-6 flex items-center justify-end">{d}</span>
            ))}
          </div>

          {/* Grid */}
          <div
            className="grid gap-1 grid-flow-col"
            style={{
              gridTemplateRows: 'repeat(7, 24px)',
              gridTemplateColumns: 'repeat(14, 24px)'
            }}
          >
            {slots.map((dayObj, i) => {
              if (!dayObj) {
                return <div key={`pad-${i}`} className="w-6 h-6 bg-transparent" />;
              }

              const { date } = dayObj;
              const dKey = dateKey(date);
              const rawCount = counts[dKey] ?? 0;
              const level = getHeatLevel(rawCount);
              const isToday = isSameDay(date, today);

              // "3 done, Mon, Oct 12"
              const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const tooltipText = `${rawCount} done, ${dayStr}`;

              return (
                <button
                  key={dKey}
                  onClick={() => scrollToDaily(dKey)}
                  onMouseEnter={(e) => handleMouseEnter(e, tooltipText)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-6 h-6 rounded-[3px] transition-colors duration-150 relative ${
                    isLoading ? 'bg-heat-empty animate-pulse' : HEAT_COLORS[level]
                  } hover:outline-none hover:ring-2 hover:ring-green-mid hover:ring-offset-1 hover:z-20 ${
                    isToday ? 'ring-2 ring-offset-[1px] ring-green-mid/70 z-10' : ''
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-4 text-[10px] font-medium text-green-gray">
          <span>Less</span>
          {HEAT_COLORS.map(c => (
            <span key={c} className={`w-2.5 h-2.5 rounded-[2px] ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Tooltip Portal */}
      {hoveredCell && (
        <div
          className="fixed z-[100] rounded-md bg-green-deep text-white px-2.5 py-1 text-[11px] font-medium shadow-lg pointer-events-none whitespace-nowrap transform -translate-x-1/2 -translate-y-full"
          style={{
            left: hoveredCell.x,
            top: hoveredCell.y,
          }}
        >
          {hoveredCell.text}
        </div>
      )}
    </div>
  );
}
