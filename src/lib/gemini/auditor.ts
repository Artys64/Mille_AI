import { geminiFlash, strictModeConfig } from "./client"

// ENEM Essay Competencies
export const ENEM_COMPETENCIES = {
  C1: {
    name: "Domínio da norma culta",
    description: "Demonstrar domínio da modalidade escrita formal da língua portuguesa",
    maxScore: 200,
  },
  C2: {
    name: "Compreensão do tema",
    description: "Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento",
    maxScore: 200,
  },
  C3: {
    name: "Argumentação",
    description: "Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos",
    maxScore: 200,
  },
  C4: {
    name: "Coesão textual",
    description: "Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação",
    maxScore: 200,
  },
  C5: {
    name: "Proposta de intervenção",
    description: "Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos",
    maxScore: 200,
  },
} as const

export interface EssayGradingResult {
  totalScore: number
  competencies: {
    [key: string]: {
      score: number
      feedback: string
      strengths: string[]
      weaknesses: string[]
    }
  }
  overallFeedback: string
  criticalErrors: string[]
  improvementSuggestions: string[]
}

export async function gradeEssay(
  essay: string,
  theme: string
): Promise<EssayGradingResult> {
  const prompt = `
Você é O Auditor, um corretor de redações extremamente rigoroso e técnico.
Sua função é avaliar redações do ENEM com precisão absoluta, sem arredondamentos amigáveis.

TEMA DA REDAÇÃO: ${theme}

TEXTO DO ALUNO:
${essay}

Avalie a redação seguindo ESTRITAMENTE os critérios do ENEM:

1. COMPETÊNCIA 1 (0-200): Domínio da norma culta
   - Analise erros gramaticais, ortográficos, de pontuação e concordância
   - Seja RIGOROSO. Cada erro conta.

2. COMPETÊNCIA 2 (0-200): Compreensão do tema
   - O aluno entendeu e desenvolveu o tema proposto?
   - Há tangenciamento ou fuga ao tema?

3. COMPETÊNCIA 3 (0-200): Argumentação
   - Os argumentos são consistentes e bem fundamentados?
   - Há repertório sociocultural legítimo e pertinente?

4. COMPETÊNCIA 4 (0-200): Coesão textual
   - Os conectivos são usados corretamente?
   - Há progressão textual adequada?

5. COMPETÊNCIA 5 (0-200): Proposta de intervenção
   - A proposta é detalhada com os 5 elementos obrigatórios?
   - (Agente, ação, meio, finalidade, detalhamento)

IMPORTANTE:
- NÃO seja generoso nas notas
- Identifique TODOS os erros
- Seja específico nos feedbacks
- Aponte citações incorretas ou mal utilizadas

Responda em formato JSON válido:
{
  "totalScore": <soma das 5 competências>,
  "competencies": {
    "C1": { "score": <0-200>, "feedback": "<análise técnica>", "strengths": ["<pontos fortes>"], "weaknesses": ["<pontos fracos>"] },
    "C2": { "score": <0-200>, "feedback": "<análise técnica>", "strengths": ["<pontos fortes>"], "weaknesses": ["<pontos fracos>"] },
    "C3": { "score": <0-200>, "feedback": "<análise técnica>", "strengths": ["<pontos fortes>"], "weaknesses": ["<pontos fracos>"] },
    "C4": { "score": <0-200>, "feedback": "<análise técnica>", "strengths": ["<pontos fortes>"], "weaknesses": ["<pontos fracos>"] },
    "C5": { "score": <0-200>, "feedback": "<análise técnica>", "strengths": ["<pontos fortes>"], "weaknesses": ["<pontos fracos>"] }
  },
  "overallFeedback": "<síntese da avaliação>",
  "criticalErrors": ["<erros graves que precisam ser corrigidos imediatamente>"],
  "improvementSuggestions": ["<sugestões específicas de melhoria>"]
}
`

  const result = await geminiFlash.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: strictModeConfig,
  })

  const response = result.response.text()

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse grading response")
  }

  return JSON.parse(jsonMatch[0]) as EssayGradingResult
}
