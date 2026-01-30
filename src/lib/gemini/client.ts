import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Gemini 2.5 Flash - optimized for low latency
export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
})

// Configuration for strict grading mode (The Auditor)
export const strictModeConfig = {
  temperature: 0.1, // Low temperature for consistent, precise outputs
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8192,
}

// Configuration for educational content generation
export const educationalConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 50,
  maxOutputTokens: 4096,
}

export { genAI }
