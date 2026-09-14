export interface AiStatus {
  enabled: boolean;
  provider: string;
  model: string;
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

export interface AssistantResponse {
  answer: string;
  suggestedActions?: {
    label: string;
    action: string;
  }[];
}
