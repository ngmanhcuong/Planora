export interface TimeBlock {
  start: Date;
  end: Date;
  type: 'EVENT' | 'CLASS';
  title?: string;
}

export interface CandidateFreeSlot {
  start: string; // ISO String
  end: string;   // ISO String
  durationMinutes: number;
}

export function calculateFreeSlots(
  startDateStr: string,
  endDateStr: string,
  events: { startAt: Date; endAt: Date; title?: string }[],
  timetableItems: { dayOfWeek: number; startTime: string; endTime: string; subjectName?: string }[],
  minSlotMinutes: number = 30
): CandidateFreeSlot[] {
  const startRange = new Date(startDateStr);
  const endRange = new Date(endDateStr);
  if (isNaN(startRange.getTime()) || isNaN(endRange.getTime())) return [];

  // 1. Collect all busy blocks in date range
  const busyBlocks: TimeBlock[] = [];

  // Add events
  events.forEach((evt) => {
    if (evt.endAt > startRange && evt.startAt < endRange) {
      busyBlocks.push({
        start: evt.startAt,
        end: evt.endAt,
        type: 'EVENT',
        title: evt.title,
      });
    }
  });

  // Loop through each day in date range to map timetable items
  const curr = new Date(startRange);
  curr.setHours(0, 0, 0, 0);

  const endLimit = new Date(endRange);
  endLimit.setHours(23, 59, 59, 999);

  while (curr <= endLimit) {
    const jsDay = curr.getDay(); // 0=Sun, 1=Mon...6=Sat
    const mondayBasedDay = (jsDay + 6) % 7; // 0=Mon...6=Sun

    const matchingClasses = timetableItems.filter((item) => item.dayOfWeek === mondayBasedDay);

    matchingClasses.forEach((cls) => {
      const [sh, sm] = cls.startTime.split(':').map(Number);
      const [eh, em] = cls.endTime.split(':').map(Number);

      const classStart = new Date(curr);
      classStart.setHours(sh || 7, sm || 0, 0, 0);

      const classEnd = new Date(curr);
      classEnd.setHours(eh || 9, em || 0, 0, 0);

      if (classEnd > startRange && classStart < endRange) {
        busyBlocks.push({
          start: classStart,
          end: classEnd,
          type: 'CLASS',
          title: cls.subjectName,
        });
      }
    });

    curr.setDate(curr.getDate() + 1);
  }

  // Sort busy blocks by start time
  busyBlocks.sort((a, b) => a.start.getTime() - b.start.getTime());

  // 2. Generate candidate free slots per day (07:00 to 22:00)
  const freeSlots: CandidateFreeSlot[] = [];
  const dayLoop = new Date(startRange);
  dayLoop.setHours(0, 0, 0, 0);

  while (dayLoop <= endLimit) {
    const dayStart = new Date(dayLoop);
    dayStart.setHours(7, 0, 0, 0);

    const dayEnd = new Date(dayLoop);
    dayEnd.setHours(22, 0, 0, 0);

    // Get busy blocks for this day
    const dayBusy = busyBlocks
      .filter((b) => b.end > dayStart && b.start < dayEnd)
      .map((b) => ({
        start: b.start < dayStart ? dayStart : b.start,
        end: b.end > dayEnd ? dayEnd : b.end,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    let currentPointer = new Date(dayStart);

    dayBusy.forEach((b) => {
      if (b.start > currentPointer) {
        const gapMinutes = Math.floor((b.start.getTime() - currentPointer.getTime()) / 60000);
        if (gapMinutes >= minSlotMinutes) {
          freeSlots.push({
            start: currentPointer.toISOString(),
            end: b.start.toISOString(),
            durationMinutes: gapMinutes,
          });
        }
      }
      if (b.end > currentPointer) {
        currentPointer = new Date(b.end);
      }
    });

    if (dayEnd > currentPointer) {
      const gapMinutes = Math.floor((dayEnd.getTime() - currentPointer.getTime()) / 60000);
      if (gapMinutes >= minSlotMinutes) {
        freeSlots.push({
          start: currentPointer.toISOString(),
          end: dayEnd.toISOString(),
          durationMinutes: gapMinutes,
        });
      }
    }

    dayLoop.setDate(dayLoop.getDate() + 1);
  }

  return freeSlots;
}
