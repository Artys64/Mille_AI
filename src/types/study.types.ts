export type ExamTarget = "ENEM" | "MEDICINA" | "ITA_IME" | "UFC"

export interface Subject {
  id: string
  name: string
  weight: number // Weight for the target course (W_subject)
  targetExam: ExamTarget
}

export interface PerformanceGap {
  subjectId: string
  currentScore: number
  targetScore: number // Cut-off score
  gap: number // G_performance = targetScore - currentScore
}

export interface OpportunityCost {
  subjectId: string
  cost: number // CO = T_remaining / (W_subject × G_performance)
  priority: number // Ranking based on cost
}

export interface StudyPlan {
  id: string
  userId: string
  targetExam: ExamTarget
  examDate: Date
  daysRemaining: number // T_remaining
  subjects: Subject[]
  performanceGaps: PerformanceGap[]
  opportunityCosts: OpportunityCost[]
  dailyTasks: DailyTask[]
  createdAt: Date
  updatedAt: Date
}

export interface DailyTask {
  id: string
  subjectId: string
  type: "micro_lesson" | "exercise" | "flashcard" | "mental_map" | "essay"
  title: string
  description: string
  estimatedMinutes: number
  completed: boolean
  completedAt?: Date
}

export interface UserProgress {
  userId: string
  totalStudyMinutes: number
  completedTasks: number
  essaysGraded: number
  averageEssayScore: number
  subjectScores: Record<string, number>
  streak: number
  lastActivityAt: Date
}
