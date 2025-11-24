export interface UserData {
  birthDate: string;
  expectedAge: number;
  currentStatus: UserStatus;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

export enum UserStatus {
  CAREER = 'CAREER',
  STUDYING = 'STUDYING',
  SEARCHING = 'SEARCHING'
}

export interface WeekStatus {
  weekIndex: number; // 0 to (90*52)-1
  status: 'lived' | 'current' | 'future' | 'selected' | 'impact';
  note?: string;
}

export interface WeeklyGoal {
  id: string; // "year-week"
  text: string;
  isCompleted: boolean;
}

export interface DayTask {
  id: string; // "blockIndex" (0-143)
  text: string;
  isCompleted: boolean;
  timeRange: string; // "10:00 - 10:10"
}

export interface AIAnalysisResult {
  weeksConsumed: number;
  percentageOfRemaining: number;
  impactDescription: string;
  tone: 'neutral' | 'warning' | 'positive';
  advice: string;
  pastImpact: string;
  stressLevel: 'low' | 'medium' | 'high';
  burnoutRisk: string;
}

export interface LifeOracleResponse {
  answer: string;
  philosophicalQuote: string;
}

export enum CalendarView {
  LOGIN = 'LOGIN',
  ONBOARDING = 'ONBOARDING',
  CALENDAR = 'CALENDAR'
}

export type CalendarMode = 'LIFE' | 'DAY';

export interface LifeStage {
  label: string;
  startAge: number;
  endAge: number; // exclusive
  color: string;
  pastColor: string;
}

export enum MilestoneType {
  ACHIEVEMENT = 'ACHIEVEMENT',
  RELATIONSHIP = 'RELATIONSHIP',
  TRAVEL = 'TRAVEL',
  CAREER = 'CAREER'
}

export interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description?: string;
  date?: string;
}