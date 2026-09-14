export interface AiStatusResponse {
  enabled: boolean;
  provider: string;
  model: string;
}

export interface TaskPrioritizationRequest {
  taskIds?: string[];
}

export interface TaskPriorityRecommendation {
  taskId: string;
  rank: number;
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reason: string;
}

export interface TaskPrioritizationResponse {
  recommendations: TaskPriorityRecommendation[];
}

export interface ScheduleRequest {
  taskIds: string[];
  startDate: string;
  endDate: string;
  preferences?: {
    preferredSessionMinutes?: number;
    breakMinutes?: number;
  };
}

export interface ScheduleSuggestion {
  taskId: string;
  taskTitle: string;
  start: string;
  end: string;
  reason: string;
  confidence: number;
}

export interface ScheduleResponse {
  suggestions: ScheduleSuggestion[];
  warnings: string[];
}

export interface ApplyScheduleSession {
  taskId: string;
  start: string;
  end: string;
}

export interface ApplyScheduleRequest {
  sessions: ApplyScheduleSession[];
}

export interface AssistantRequest {
  message: string;
}

export interface AssistantResponse {
  answer: string;
  suggestedActions?: {
    label: string;
    action: string;
  }[];
}

export interface UserAiContext {
  currentTimeIso: string;
  userName: string;
  incompleteTasks: {
    id: string;
    title: string;
    priority: string;
    dueDate: string;
    dueTime?: string | null;
    isOverdue: boolean;
    courseCode?: string | null;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
    location?: string | null;
  }[];
  timetableItems: {
    id: string;
    subjectName: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string | null;
  }[];
  habitSummaries: {
    id: string;
    title: string;
    completedToday: boolean;
    currentStreak: number;
  }[];
  todayScore: number;
}

export interface AiProvider {
  isConfigured(): boolean;
  getProviderName(): string;
  getModelName(): string;

  generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    fallbackValue: T
  ): Promise<T>;

  chat(
    systemPrompt: string,
    userMessage: string
  ): Promise<string>;
}
