import { getGridSlots, shortDate, dateKey, isSameDay } from '../utils/dates';
import { useDailyCounts } from '../hooks/data';

const HEAT_COLORS = [
  'bg-heat-empty', // 0
  'bg-heat-1',     // 1-2
  'bg-heat-2',     // 3-4
  'bg-heat-3',     // 5-6
  'bg-heat-4',     // 7+
];

function getHeatLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

export default function Heatmap() {
  const slots = getGridSlots(); // 1D array of 98 items (14 cols x 7 rows)
  const { counts, isLoading } = useDailyCounts();
  const today = new Date();

  // Find where months start to drop a label.
  const monthLabels = [];
  let currentMonth = -1;

  for (let col = 0; col < 14; col++) {
    let foundMonthInCol = -1;
    for (let row = 0; row < 7; row++) {
      const idx = col * 7 + row;
      if (slots[idx] !== null) {
        foundMonthInCol = slots[idx].date.getMonth();
        break;
      }
    }

    if (foundMonthInCol !== -1 && foundMonthInCol !== currentMonth) {
      const triggerSlot = slots.slice(col * 7, col * 7 + 7).find(s => s !== null);
      if (triggerSlot) {
        monthLabels.push({
          label: triggerSlot.date.toLocaleString('en-US', { month: 'short' }),
          colIndex: col,
        });
        currentMonth = foundMonthInCol;
      }
    }
  }

  const scrollToDaily = (dateStr) => {
    const element = document.getElementById(`day-${dateStr}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section>
      <div className="w-full flex-col mt-4">
        {/* Month labels row */}
        <div
          className="relative mb-2 h-5 text-sm text-green-gray font-medium tracking-wide"
          style={{ width: '100%' }}
        >
          {monthLabels.map(({ label, colIndex }) => (
            <span
              key={`${label}-${colIndex}`}
              style={{
                position: 'absolute',
                left: `calc((${colIndex} / 14) * 100%)`,
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* CSS Grid for Heatmap explicitly setting columns and rows */}
        <div
          className="grid gap-[2px] sm:gap-2 w-full"
          style={{
             gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
             gridTemplateColumns: 'repeat(14, minmax(0, 1fr))',
             gridAutoFlow: 'column',
          }}
        >
          {slots.map((dayObj, i) => {
            if (!dayObj) {
              return <div key={`pad-${i}`} className="aspect-square bg-transparent" />;
            }

            const { date } = dayObj;
            const dKey = dateKey(date);
            const rawCount = counts[dKey] ?? 0;
            const level = getHeatLevel(rawCount);
            const isToday = isSameDay(date, today);

            return (
              <button
                key={dKey}
                onClick={() => scrollToDaily(dKey)}
                title={`${rawCount} done on ${shortDate(date)}`}
                className={`aspect-square w-full rounded-[3px] sm:rounded-md transition-all duration-200 ${
                  isLoading ? 'bg-heat-empty animate-pulse' : HEAT_COLORS[level]
                } hover:scale-125 hover:shadow-md hover:z-10 ${
                  isToday ? 'ring-2 ring-offset-2 ring-green-mid outline-none z-10' : ''
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
