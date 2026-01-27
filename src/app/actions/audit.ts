'use server'

import { genAI, strictModeConfig } from "@/lib/gemini/client"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const SYSTEM_PROMPT = `PERSONA:
Você é o Auditor Mille AI, um corretor sênior de bancas de elite (Medicina/ITA).
Sua função não é ensinar, é AUDITAR. Você é técnico, frio e cirúrgico.

TAREFA:
Analise a redação enviada com base nas 5 Competências do ENEM.
Aplique rigor máximo. Não arredonde notas para cima. Se houver dúvida, puna.

FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
Retorne APENAS um JSON válido. Sem markdown, sem texto antes ou depois.

{
  "total_score": number (0-1000),
  "competencies": {
    "c1": { "score": number (0,40,80,120,160,200), "errors": "lista de erros gramaticais" },
    "c2": { "score": number, "analysis": "análise do tema e repertório" },
    "c3": { "score": number, "gaps": "lacunas argumentativas detectadas" },
    "c4": { "score": number, "connectives": "avaliação de coesão" },
    "c5": { "score": number, "details": "elementos da proposta presentes/ausentes" }
  },
  "strict_feedback": "Uma frase dura e direta sobre o maior defeito do texto",
  "action_plan": "A única coisa técnica que o aluno deve estudar hoje"
}

REGRAS:
1. NUNCA elogie.
2. Se o texto for curto demais (<7 linhas), dê nota 0.
3. Use terminologia técnica (ex: 'Truncamento', 'Quebra de Paralelismo', 'Repertório Improdutivo').
4. Notas válidas por competência: 0, 40, 80, 120, 160, 200.
5. Repertório só é produtivo se estiver INTEGRADO ao argumento.`

export interface AuditResult {
  success: true
  data: {
    total_score: number
    competencies: {
      c1: { score: number; errors: string }
      c2: { score: number; analysis: string }
      c3: { score: number; gaps: string }
      c4: { score: number; connectives: string }
      c5: { score: number; details: string }
    }
    strict_feedback: string
    action_plan: string
  }
}

export interface AuditError {
  success: false
  error: string
}

export type AuditResponse = AuditResult | AuditError

export async function auditEssay(formData: FormData): Promise<AuditResponse> {
  const essayText = formData.get("essay") as string
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Você precisa estar logado para usar o auditor." }
  }

  // 2. Validação de texto mínimo
  const lines = essayText.trim().split('\n').filter(l => l.trim()).length
  if (lines < 7) {
    return { success: false, error: "Texto muito curto. Mínimo de 7 linhas para uma análise válida." }
  }

  // 3. Setup Gemini (2.5 Flash para velocidade)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-05-20",
    generationConfig: {
      ...strictModeConfig,
      responseMimeType: "application/json"
    }
  })

  try {
    // 4. Call AI
    const result = await model.generateContent([
      SYSTEM_PROMPT,
      `REDAÇÃO DO ALUNO:\n${essayText}`
    ])

    const responseText = result.response.text()
    const evaluation = JSON.parse(responseText)

    // 5. Save to DB
    const { error: dbError } = await supabase.from("corrections").insert({
      user_id: user.id,
      essay_text: essayText,
      total_score: evaluation.total_score,
      breakdown: evaluation.competencies,
      strict_feedback: evaluation.strict_feedback,
      action_plan: evaluation.action_plan
    })

    if (dbError) {
      console.error("Database Error:", dbError)
      return { success: false, error: "Falha ao salvar correção. Tente novamente." }
    }

    return { success: true, data: evaluation }

  } catch (err) {
    console.error("Audit Failed:", err)
    return { success: false, error: "Falha na auditoria. Tente novamente." }
  }
}

export async function auditEssayAndRedirect(formData: FormData): Promise<void> {
  const result = await auditEssay(formData)

  if (!result.success) {
    throw new Error(result.error)
  }

  redirect("/dashboard")
}
