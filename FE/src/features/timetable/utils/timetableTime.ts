/** Visible day range for the weekly grid (minutes from midnight). */
export const TIMETABLE_GRID_START = 7 * 60; // 07:00
export const TIMETABLE_GRID_END = 21 * 60; // 21:00 (last row 20:00)
export const TIMETABLE_HOUR_HEIGHT_PX = 48;
/** Max height of the scrollable grid — header + body share width (no column drift). */
export const TIMETABLE_GRID_MAX_HEIGHT_PX = 560;
/** Fixed time column + 7 equal day columns. */
export const TIMETABLE_GRID_TEMPLATE = '3.25rem repeat(7, minmax(0, 1fr))';

export const parseTimeToMinutes = (time?: string | null): number => {
  if (!time) return TIMETABLE_GRID_START;
  const [hourPart, minutePart] = time.split(':');
  const hours = Number.parseInt(hourPart ?? '0', 10);
  const minutes = Number.parseInt(minutePart ?? '0', 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return TIMETABLE_GRID_START;
  return hours * 60 + minutes;
};

export const minutesToTimeString = (totalMinutes: number): string => {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const formatTimeRangeLabel = (startTime: string, endTime: string): string =>
  `${startTime} – ${endTime}`;

export const getTimetableGridHeightPx = (): number => {
  const hours = (TIMETABLE_GRID_END - TIMETABLE_GRID_START) / 60;
  return hours * TIMETABLE_HOUR_HEIGHT_PX;
};

export const getHourRows = (): { startMinutes: number; label: string }[] => {
  const rows: { startMinutes: number; label: string }[] = [];
  for (let m = TIMETABLE_GRID_START; m < TIMETABLE_GRID_END; m += 60) {
    rows.push({ startMinutes: m, label: minutesToTimeString(m) });
  }
  return rows;
};

export const minutesToTopPx = (startMinutes: number): number => {
  const offset = Math.max(0, startMinutes - TIMETABLE_GRID_START);
  return (offset / 60) * TIMETABLE_HOUR_HEIGHT_PX;
};

export const durationToHeightPx = (startMinutes: number, endMinutes: number): number => {
  const duration = Math.max(15, endMinutes - startMinutes);
  return (duration / 60) * TIMETABLE_HOUR_HEIGHT_PX;
};

export const clampEventMinutes = (startMinutes: number, endMinutes: number) => {
  const start = Math.max(TIMETABLE_GRID_START, Math.min(startMinutes, TIMETABLE_GRID_END - 15));
  const end = Math.max(start + 15, Math.min(endMinutes, TIMETABLE_GRID_END));
  return { start, end };
};

export const rangesOverlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd;

export const isHourAvailable = (
  dayEvents: { startMinutes: number; endMinutes: number }[],
  hourStartMinutes: number
) => {
  const hourEnd = hourStartMinutes + 60;
  return !dayEvents.some((event) =>
    rangesOverlap(event.startMinutes, event.endMinutes, hourStartMinutes, hourEnd)
  );
};

export const defaultEndTime = (startTime: string, durationMinutes = 90): string =>
  minutesToTimeString(parseTimeToMinutes(startTime) + durationMinutes);
