# CLAUDE.md - Mille AI Assistant Guide

## Projeto Overview

**Mille AI** - Plataforma de auditoria de alta performance para estudantes de cursos de alta concorrência (Medicina, ITA/IME, UFC).

**Status Atual:** Fase 1 - Implementação do Auditor "Strict Mode"

---

## Fase 1: Auditor "Strict Mode"

### Objetivo
Criar o motor de correção de redação mais rigoroso do mercado, com:
- Latência < 3s
- Feedback estruturado em JSON
- Rigor técnico de corretor de banca de elite

### Arquitetura da Solução

```
[Input]          [Server Action]       [Intelligence]        [Persistence]      [Output]
Textarea  -->  app/actions/audit.ts --> Gemini 1.5 Flash --> Supabase DB  -->  Dashboard
                                         (JSON Mode)          (corrections)     (Radar Chart)
```

**Fluxo de Dados (Next.js Server Actions):**
1. **Input:** Aluno envia texto via `<textarea>`
2. **Server Action:** Backend recebe texto, injeta System Prompt "Carrasco"
3. **Intelligence:** Envio para Gemini 1.5 Flash com `responseMimeType: "application/json"`
4. **Persistence:** JSON salvo na tabela `corrections` (Supabase)
5. **Output:** Frontend renderiza nota e gráfico de radar

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── actions/
│   │   └── audit.ts          # Server Action principal (A CRIAR)
│   ├── auditor/
│   │   └── page.tsx          # Interface do auditor (A CRIAR)
│   ├── dashboard/
│   │   └── page.tsx          # Visualização de resultados (A CRIAR)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       └── button.tsx
├── lib/
│   ├── gemini/
│   │   ├── client.ts         # Cliente Gemini configurado
│   │   └── auditor.ts        # Lógica de correção existente
│   └── supabase/
│       ├── client.ts         # Cliente browser
│       ├── server.ts         # Cliente server-side
│       └── middleware.ts
├── types/
│   ├── essay.types.ts        # Tipos de redação/correção
│   ├── study.types.ts
│   └── index.ts
└── middleware.ts
```

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | Next.js | 16.1.5 |
| Runtime | React | 19.2.3 |
| Engine de IA | Gemini 1.5 Flash | via @google/generative-ai |
| Backend/DB | Supabase | @supabase/ssr 0.8.0 |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui | custom |

---

## Variáveis de Ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Banco de Dados (Supabase Setup)

### Tabela `corrections`

Execute no SQL Editor do Supabase:

```sql
-- Tabela de Correções
CREATE TABLE corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  essay_text TEXT NOT NULL,

  -- Nota Final e Breakdown
  total_score INT NOT NULL,
  breakdown JSONB NOT NULL,

  -- Feedback Qualitativo
  strict_feedback TEXT,
  action_plan TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para queries por usuário
CREATE INDEX idx_corrections_user_id ON corrections(user_id);
CREATE INDEX idx_corrections_created_at ON corrections(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own corrections"
ON corrections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own corrections"
ON corrections FOR SELECT
USING (auth.uid() = user_id);
```

### Schema do campo `breakdown` (JSONB)

```typescript
interface Breakdown {
  c1: { score: number; errors: string }
  c2: { score: number; analysis: string }
  c3: { score: number; gaps: string }
  c4: { score: number; connectives: string }
  c5: { score: number; details: string }
}
```

---

## System Prompt: "O Auditor Carrasco"

```text
PERSONA:
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
5. Repertório só é produtivo se estiver INTEGRADO ao argumento.
```

---

## Implementação: Server Action

**Arquivo:** `src/app/actions/audit.ts`

```typescript
'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `
PERSONA: Você é o Auditor Mille AI, corretor sênior de bancas de elite.
OUTPUT: JSON estrito seguindo o schema especificado.
REGRAS: Seja punitivo. Não use markdown. Retorne apenas o JSON.

FORMATO:
{
  "total_score": number (0-1000),
  "competencies": {
    "c1": { "score": number, "errors": string },
    "c2": { "score": number, "analysis": string },
    "c3": { "score": number, "gaps": string },
    "c4": { "score": number, "connectives": string },
    "c5": { "score": number, "details": string }
  },
  "strict_feedback": string,
  "action_plan": string
}
`

export async function auditEssay(formData: FormData) {
  const essayText = formData.get("essay") as string
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 2. Validação de texto mínimo
  const lines = essayText.trim().split('\n').filter(l => l.trim()).length
  if (lines < 7) {
    return { error: "Texto muito curto. Mínimo de 7 linhas." }
  }

  // 3. Setup Gemini (Flash para velocidade)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
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
    const { error } = await supabase.from("corrections").insert({
      user_id: user.id,
      essay_text: essayText,
      total_score: evaluation.total_score,
      breakdown: evaluation.competencies,
      strict_feedback: evaluation.strict_feedback,
      action_plan: evaluation.action_plan
    })

    if (error) throw new Error(error.message)

  } catch (err) {
    console.error("Audit Failed:", err)
    return { error: "Falha na auditoria. Tente novamente." }
  }

  // 6. Redirect to Results
  redirect("/dashboard")
}
```

---

## Implementação: Frontend

**Arquivo:** `src/app/auditor/page.tsx`

```typescript
'use client'

import { auditEssay } from '@/app/actions/audit'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      disabled={pending}
      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800
                 text-white font-bold py-4 rounded-lg transition-all"
    >
      {pending ? "AUDITANDO..." : "INICIAR AUDITORIA RIGOROSA"}
    </button>
  )
}

export default function AuditorPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-2 tracking-tighter">
        MILLE AI <span className="text-red-600">AUDITOR</span>
      </h1>
      <p className="text-gray-400 mb-8">
        Strict Mode: Active. Prepare-se para a verdade.
      </p>

      <form action={auditEssay} className="space-y-6">
        <textarea
          name="essay"
          placeholder="Cole sua redação aqui..."
          className="w-full h-96 p-4 bg-zinc-900 border border-zinc-800
                     rounded-lg focus:border-red-500 focus:ring-1
                     focus:ring-red-500 text-gray-200 outline-none
                     resize-none font-mono"
          required
          minLength={50}
        />
        <SubmitButton />
      </form>
    </div>
  )
}
```

---

## Checklist de Validação (Fase 1)

### Funcionalidade
- [ ] **Conectividade:** Botão chama Server Action sem erro 500
- [ ] **JSON Parsing:** IA retorna JSON limpo, `JSON.parse` não quebra
- [ ] **Persistência:** Dados aparecem na tabela `corrections` do Supabase
- [ ] **Auth:** Usuário não autenticado recebe erro apropriado

### Qualidade de Resposta
- [ ] **Rigor:** Texto ruim recebe nota baixa (<600)
- [ ] **Realismo:** Texto bom recebe nota realista (920-960), não 1000
- [ ] **Latência:** Resposta em < 3 segundos

### UX
- [ ] **Loading State:** Botão mostra "AUDITANDO..." durante processamento
- [ ] **Erro Handling:** Erros são exibidos ao usuário de forma clara
- [ ] **Redirect:** Após sucesso, redireciona para `/dashboard`

---

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Lint
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit
```

---

## Convenções de Código

### Naming
- Componentes: PascalCase (`AuditorPage.tsx`)
- Funções/variáveis: camelCase (`auditEssay`, `essayText`)
- Constantes: SCREAMING_SNAKE_CASE (`SYSTEM_PROMPT`)
- Types/Interfaces: PascalCase (`EssayGradingResult`)

### Estrutura de Arquivos
- Server Actions: `src/app/actions/`
- Componentes UI: `src/components/ui/`
- Bibliotecas: `src/lib/`
- Tipos: `src/types/`

### Estilo
- Tailwind CSS para styling
- Design system: "Industrial-Dark" (fundo preto, acentos vermelhos)
- Foco em densidade técnica, zero elementos motivacionais

---

## Notas Importantes

1. **Modelo de IA:** Usar `gemini-1.5-flash` (não `gemini-2.5`, ainda não público)
2. **JSON Mode:** Sempre usar `responseMimeType: "application/json"` para respostas estruturadas
3. **RLS:** Row Level Security está ativo - usuários só veem suas próprias correções
4. **Validação:** Mínimo de 7 linhas para evitar correções de textos incompletos
5. **Zero-Fluff Policy:** Proibido conteúdo motivacional vazio. Foco é densidade técnica.

---

## Roadmap

- [x] **Fase 1:** Engine de Redação (The Auditor - Strict Mode) - EM PROGRESSO
- [ ] **Fase 2:** Diagnóstico de Exatas e Natureza via OCR de rascunhos
- [ ] **Fase 3:** Algoritmo de Cronograma Adaptativo e Banco de Micro-Aulas
- [ ] **Fase 4:** Simulados Preditivos baseados no TRI Real
