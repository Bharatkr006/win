export const ARC_START = new Date(2026, 9, 1);
export const ARC_END = new Date(2026, 11, 31);
export const TOTAL_DAYS = 92;

export function getGridDayOfWeek(date) {
  const dow = date.getDay();
  return dow === 0 ? 6 : dow - 1;
}

export function getGridSlots() {
  const slots = [];
  const startDay = new Date(ARC_START);
  const startOffset = getGridDayOfWeek(startDay);

  let cursor = new Date(startDay);
  cursor.setDate(cursor.getDate() - startOffset);

  // Exactly 14 weeks (98 slots) cover the full width perfectly.
  for (let i = 0; i < 98; i++) {
    if (cursor >= ARC_START && cursor <= ARC_END) {
      slots.push({ date: new Date(cursor) });
    } else {
      slots.push(null);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
}

export function getArcDays() {
  const days = [];
  const cursor = new Date(ARC_START);
  for (let i = 0; i < TOTAL_DAYS; i++) {
    days.push({ date: new Date(cursor), dayIndex: i });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function shortDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function longDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export function isSameWeek(d1, d2) {
  const getMonday = (d) => {
    const day = new Date(d);
    const dow = getGridDayOfWeek(day);
    day.setDate(day.getDate() - dow);
    day.setHours(0, 0, 0, 0);
    return day.getTime();
  };
  return getMonday(d1) === getMonday(d2);
}

export function getElapsedArcDays() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const start = new Date(ARC_START);

  if (today < start) return 0;
  if (today > ARC_END) return TOTAL_DAYS;

  const diff = today.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}