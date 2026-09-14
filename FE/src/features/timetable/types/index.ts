export interface TimetableClassItem {
  id: string;
  subjectName: string;
  courseCode: string;
  dayIndex: number; // 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat
  timeRange: string;
  startSlot: number; // 1 to 10
  slotSpan: number; // e.g. 3 slots
  room: string;
  lecturer: string;
  color: string;
  bgColor: string;
  textColor: string;
  type: 'theory' | 'practice' | 'exam';
  typeLabel: string;
  notes?: string;
}

export interface TermSemesterInfo {
  termName: string;
  academicYear: string;
  totalCredits: number;
  totalSubjects: number;
}
