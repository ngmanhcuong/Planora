export interface TimetableClassItem {
  id: string;
  subjectName: string;
  courseCode: string;
  dayIndex: number; // 0 = Mon … 6 = Sun
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timeRange: string;
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
