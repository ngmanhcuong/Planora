export const getStartOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sun, 1 is Mon...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const getEndOfWeek = (d: Date): Date => {
  const monday = getStartOfWeek(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

export const getWeekNumber = (d: Date): number => {
  const date = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayNr + 3);
  const firstThursday = date.valueOf();
  date.setMonth(0, 1);
  if (date.getDay() !== 4) {
    date.setMonth(0, 1 + ((4 - date.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThursday - date.valueOf()) / 604800000);
};

export interface WeekDayItem {
  dateObj: Date;
  dateNum: number;
  monthNum: number;
  dayKey: string;
  isToday: boolean;
  isWeekend: boolean;
}

const DAY_KEYS = [
  'weekday.mon',
  'weekday.tue',
  'weekday.wed',
  'weekday.thu',
  'weekday.fri',
  'weekday.sat',
  'weekday.sun',
];

export const getWeekDays = (monday: Date): WeekDayItem[] => {
  const todayStr = new Date().toDateString();
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return {
      dateObj: day,
      dateNum: day.getDate(),
      monthNum: day.getMonth() + 1,
      dayKey: DAY_KEYS[i],
      isToday: day.toDateString() === todayStr,
      isWeekend: i >= 5,
    };
  });
};
