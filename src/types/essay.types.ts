export interface EssayCompetency {
  score: number
  feedback: string
  strengths: string[]
  weaknesses: string[]
}

export interface EssayGradingResult {
  totalScore: number
  competencies: {
    C1: EssayCompetency
    C2: EssayCompetency
    C3: EssayCompetency
    C4: EssayCompetency
    C5: EssayCompetency
  }
  overallFeedback: string
  criticalErrors: string[]
  improvementSuggestions: string[]
}

export interface Essay {
  id: string
  userId: string
  theme: string
  content: string
  gradingResult?: EssayGradingResult
  createdAt: Date
  updatedAt: Date
}

export type CompetencyKey = "C1" | "C2" | "C3" | "C4" | "C5"
