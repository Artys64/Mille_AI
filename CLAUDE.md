# CLAUDE.md - Mille AI Assistant Guide

## Projeto Overview

**Mille AI** - Plataforma de auditoria de alta performance para estudantes de cursos de alta concorrência (Medicina, ITA/IME, UFC).

**Status Atual:** Fase 2 - Banco de Questões ENEM

---

## Roadmap

- [x] **Fase 1:** Engine de Redação (The Auditor - Strict Mode) - CONCLUÍDA
- [ ] **Fase 2:** Banco de Questões ENEM com Diagnóstico Inteligente - EM PROGRESSO
- [ ] **Fase 3:** Algoritmo de Cronograma Adaptativo e Banco de Micro-Aulas
- [ ] **Fase 4:** Simulados Preditivos baseados no TRI Real

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | Next.js | 16.1.5 |
| Runtime | React | 19.2.3 |
| Engine de IA | Gemini 2.5 Flash | via @google/generative-ai |
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

## Estrutura do Projeto

```
src/
├── app/
│   ├── actions/
│   │   ├── audit.ts              # Server Action - Auditor de Redações
│   │   ├── questions.ts          # Server Action - Questões ENEM (A CRIAR)
│   │   └── practice.ts           # Server Action - Sessões de Prática (A CRIAR)
│   ├── auditor/
│   │   └── page.tsx              # Interface do auditor
│   ├── dashboard/
│   │   └── page.tsx              # Visualização de resultados
│   ├── pratica/
│   │   ├── page.tsx              # Seleção de matéria/tópico (A CRIAR)
│   │   └── [subject]/
│   │       └── page.tsx          # Prática por disciplina (A CRIAR)
│   ├── diagnostico/
│   │   └── page.tsx              # Dashboard de diagnóstico (A CRIAR)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   └── button.tsx
│   └── questions/
│       ├── QuestionCard.tsx      # Card de questão (A CRIAR)
│       ├── AnswerFeedback.tsx    # Feedback pós-resposta (A CRIAR)
│       └── TopicProgress.tsx     # Progresso por tópico (A CRIAR)
├── lib/
│   ├── gemini/
│   │   ├── client.ts             # Cliente Gemini configurado
│   │   ├── auditor.ts            # Lógica de correção de redações
│   │   └── mistake-analyzer.ts   # Análise de erros em questões (A CRIAR)
│   └── supabase/
│       ├── client.ts             # Cliente browser
│       ├── server.ts             # Cliente server-side
│       └── middleware.ts
├── types/
│   ├── essay.types.ts            # Tipos de redação/correção
│   ├── question.types.ts         # Tipos de questões ENEM (A CRIAR)
│   ├── study.types.ts
│   └── index.ts
└── middleware.ts
```

---

# FASE 1: Auditor "Strict Mode" (CONCLUÍDA)

## Objetivo
Motor de correção de redação rigoroso com latência < 3s, feedback em JSON, rigor de corretor de banca de elite.

## Arquitetura

```
[Input]          [Server Action]       [Intelligence]        [Persistence]      [Output]
Textarea  -->  app/actions/audit.ts --> Gemini 2.5 Flash --> Supabase DB  -->  Dashboard
                                         (JSON Mode)          (corrections)     (Radar Chart)
```

## Banco de Dados - Tabela `corrections`

```sql
CREATE TABLE corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  essay_text TEXT NOT NULL,
  total_score INT NOT NULL,
  breakdown JSONB NOT NULL,
  strict_feedback TEXT,
  action_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_corrections_user_id ON corrections(user_id);
CREATE INDEX idx_corrections_created_at ON corrections(created_at DESC);

ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own corrections"
ON corrections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own corrections"
ON corrections FOR SELECT USING (auth.uid() = user_id);
```

---

# FASE 2: Banco de Questões ENEM

## Objetivo
Criar um banco de questões clássicas do ENEM com sistema de prática e diagnóstico inteligente que:
- Armazena questões históricas do ENEM (2009-2024)
- Rastreia desempenho do aluno por tópico
- Identifica fraquezas automaticamente após 10+ questões
- Classifica erros por tipo (conceito, cálculo, interpretação)
- Gera diagnóstico de maestria por tópico

## Arquitetura da Solução

```
[Seleção]        [Server Action]        [Question]          [Answer]           [Diagnosis]
Disciplina  -->  actions/practice.ts --> Fetch Question --> Submit Answer --> Update Stats
   ↓                                         ↓                   ↓                  ↓
Tópico                                  questions DB      student_answers    topic_diagnostics
                                                                ↓
                                                        [AI Mistake Analysis]
                                                        Gemini classifica erro
```

## Fluxo do Usuário

1. **Seleção:** Aluno escolhe disciplina e tópico (ou prática mista)
2. **Questão:** Sistema apresenta questão do banco
3. **Resposta:** Aluno seleciona alternativa
4. **Feedback:** Sistema mostra gabarito + explicação + análise de erro (se incorreto)
5. **Diagnóstico:** Após 10+ questões no tópico, sistema identifica fraquezas

---

## Banco de Dados - Schema Completo

### Enums

```sql
-- Áreas do conhecimento ENEM
CREATE TYPE knowledge_area AS ENUM (
  'linguagens',      -- Linguagens, Códigos e suas Tecnologias
  'humanas',         -- Ciências Humanas e suas Tecnologias
  'natureza',        -- Ciências da Natureza e suas Tecnologias
  'matematica'       -- Matemática e suas Tecnologias
);

-- Nível de dificuldade (baseado no TRI)
CREATE TYPE difficulty_level AS ENUM (
  'facil',           -- Acerto > 70% dos candidatos
  'medio',           -- Acerto 40-70% dos candidatos
  'dificil',         -- Acerto 20-40% dos candidatos
  'muito_dificil'    -- Acerto < 20% dos candidatos
);
```

### Tabela: Disciplinas (`subjects`)

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area knowledge_area NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- 'MAT', 'FIS', 'QUI', 'BIO', 'POR', 'HIS', 'GEO', 'FIL', 'SOC', 'ING', 'ESP'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados iniciais
INSERT INTO subjects (area, name, code, description) VALUES
  ('matematica', 'Matemática', 'MAT', 'Matemática e suas Tecnologias'),
  ('natureza', 'Física', 'FIS', 'Física e fenômenos naturais'),
  ('natureza', 'Química', 'QUI', 'Química e transformações da matéria'),
  ('natureza', 'Biologia', 'BIO', 'Biologia e sistemas vivos'),
  ('linguagens', 'Português', 'POR', 'Língua Portuguesa e Literatura'),
  ('linguagens', 'Inglês', 'ING', 'Língua Inglesa'),
  ('linguagens', 'Espanhol', 'ESP', 'Língua Espanhola'),
  ('linguagens', 'Artes', 'ART', 'Artes e Educação Física'),
  ('humanas', 'História', 'HIS', 'História do Brasil e do Mundo'),
  ('humanas', 'Geografia', 'GEO', 'Geografia física e humana'),
  ('humanas', 'Filosofia', 'FIL', 'Filosofia e pensamento crítico'),
  ('humanas', 'Sociologia', 'SOC', 'Sociologia e relações sociais');
```

### Tabela: Tópicos (`topics`)

```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  parent_topic_id UUID REFERENCES topics(id), -- Para subtópicos
  importance_weight INT DEFAULT 5 CHECK (importance_weight BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, code)
);
```

### Tópicos por Disciplina

#### Matemática
| Código | Tópico | Peso |
|--------|--------|------|
| MAT_RAZAO | Razão e Proporção | 9 |
| MAT_PORCENT | Porcentagem | 10 |
| MAT_ESTAT | Estatística Básica | 10 |
| MAT_PROB | Probabilidade | 8 |
| MAT_FUNC | Funções | 9 |
| MAT_GEOPLANA | Geometria Plana | 9 |
| MAT_GEOESP | Geometria Espacial | 7 |
| MAT_GEOANAL | Geometria Analítica | 6 |
| MAT_COMB | Análise Combinatória | 7 |
| MAT_PROG | Progressões | 6 |
| MAT_TRIG | Trigonometria | 5 |
| MAT_FIN | Matemática Financeira | 8 |

#### Física
| Código | Tópico | Peso |
|--------|--------|------|
| FIS_CINEM | Cinemática | 9 |
| FIS_DINAM | Dinâmica | 9 |
| FIS_ENERGIA | Energia e Trabalho | 9 |
| FIS_ELETRIC | Eletricidade | 10 |
| FIS_ONDAS | Ondulatória | 8 |
| FIS_OPTICA | Óptica | 7 |
| FIS_TERMO | Termologia | 8 |
| FIS_HIDRO | Hidrostática | 7 |
| FIS_ELETROMAG | Eletromagnetismo | 6 |

#### Química
| Código | Tópico | Peso |
|--------|--------|------|
| QUI_ESTEQ | Estequiometria | 10 |
| QUI_ORG | Química Orgânica | 9 |
| QUI_AMB | Química Ambiental | 9 |
| QUI_ELETRO | Eletroquímica | 8 |
| QUI_SOLUC | Soluções | 8 |
| QUI_TERMQ | Termoquímica | 7 |
| QUI_CINET | Cinética Química | 6 |
| QUI_EQUIL | Equilíbrio Químico | 7 |
| QUI_LIGAC | Ligações Químicas | 7 |
| QUI_RADIO | Radioatividade | 5 |

#### Biologia
| Código | Tópico | Peso |
|--------|--------|------|
| BIO_ECO | Ecologia | 10 |
| BIO_FISIO | Fisiologia Humana | 9 |
| BIO_GENET | Genética | 9 |
| BIO_CITO | Citologia | 8 |
| BIO_EVOL | Evolução | 8 |
| BIO_MICRO | Microbiologia | 8 |
| BIO_BOT | Botânica | 6 |
| BIO_ZOO | Zoologia | 5 |
| BIO_BIOQ | Bioquímica | 7 |

### Tabela: Questões (`questions`)

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  year INT NOT NULL CHECK (year >= 2009 AND year <= 2030),
  edition TEXT, -- 'regular', 'ppl', 'reaplicacao'
  question_number INT,

  -- Classificação
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  topic_id UUID REFERENCES topics(id) NOT NULL,
  secondary_topic_id UUID REFERENCES topics(id),
  difficulty difficulty_level NOT NULL DEFAULT 'medio',

  -- Conteúdo
  statement TEXT NOT NULL,
  support_text TEXT,
  image_url TEXT,
  image_description TEXT,

  -- Alternativas
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_e TEXT NOT NULL,

  -- Resposta
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),

  -- Explicação
  explanation TEXT NOT NULL,
  common_mistakes JSONB,
  key_concepts TEXT[],

  -- Metadados TRI
  tri_difficulty DECIMAL(5,3),
  tri_discrimination DECIMAL(5,3),
  tri_guessing DECIMAL(5,3),

  -- Habilidades BNCC
  skills TEXT[],
  competencies TEXT[],

  -- Controle
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_year ON questions(year);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = TRUE;
```

### Tabela: Respostas dos Alunos (`student_answers`)

```sql
CREATE TABLE student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,

  -- Resposta
  selected_answer CHAR(1) NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D', 'E')),
  is_correct BOOLEAN NOT NULL,

  -- Métricas
  time_spent_seconds INT,
  confidence_level INT CHECK (confidence_level BETWEEN 1 AND 5),

  -- Análise do erro (preenchido pela IA)
  mistake_type TEXT, -- 'conceito', 'calculo', 'interpretacao', 'desatencao', 'tempo'
  mistake_analysis TEXT,

  -- Contexto
  practice_session_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, question_id, practice_session_id)
);

-- Índices
CREATE INDEX idx_student_answers_user ON student_answers(user_id);
CREATE INDEX idx_student_answers_question ON student_answers(question_id);
CREATE INDEX idx_student_answers_correct ON student_answers(is_correct);
CREATE INDEX idx_student_answers_created ON student_answers(created_at DESC);
```

### Tabela: Diagnóstico por Tópico (`topic_diagnostics`)

```sql
CREATE TABLE topic_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,

  -- Estatísticas
  total_attempts INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  accuracy_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_attempts > 0
    THEN (correct_count::DECIMAL / total_attempts * 100)
    ELSE 0 END
  ) STORED,

  -- Análise de erros
  calc_errors INT DEFAULT 0,
  concept_errors INT DEFAULT 0,
  interpretation_errors INT DEFAULT 0,

  -- Diagnóstico
  mastery_level TEXT DEFAULT 'unknown' CHECK (mastery_level IN ('unknown', 'weak', 'developing', 'proficient', 'mastered')),
  weakness_identified BOOLEAN DEFAULT FALSE,
  weakness_description TEXT,

  -- Recomendações
  recommended_review BOOLEAN DEFAULT FALSE,
  intervention_delivered BOOLEAN DEFAULT FALSE,

  -- Controle
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_topic_diagnostics_user ON topic_diagnostics(user_id);
CREATE INDEX idx_topic_diagnostics_weakness ON topic_diagnostics(weakness_identified) WHERE weakness_identified = TRUE;
```

### Tabela: Sessões de Prática (`practice_sessions`)

```sql
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Configuração
  session_type TEXT NOT NULL CHECK (session_type IN ('topic_focus', 'mixed', 'weakness_review', 'simulation')),
  subject_id UUID REFERENCES subjects(id),
  topic_id UUID REFERENCES topics(id),

  -- Resultados
  total_questions INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  accuracy_rate DECIMAL(5,2),
  total_time_seconds INT,

  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### Row Level Security (RLS)

```sql
-- Questões: leitura para autenticados
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions are viewable by authenticated users" ON questions
  FOR SELECT TO authenticated USING (is_active = TRUE);

-- Respostas: usuário só vê as próprias
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own answers" ON student_answers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own answers" ON student_answers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Diagnósticos: usuário só vê os próprios
ALTER TABLE topic_diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own diagnostics" ON topic_diagnostics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own diagnostics" ON topic_diagnostics
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Sessões: usuário só vê as próprias
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sessions" ON practice_sessions
  FOR ALL TO authenticated USING (auth.uid() = user_id);
```

### Trigger: Atualizar Diagnóstico Automaticamente

```sql
CREATE OR REPLACE FUNCTION update_topic_diagnostic()
RETURNS TRIGGER AS $$
DECLARE
  v_topic_id UUID;
BEGIN
  -- Buscar topic_id da questão
  SELECT topic_id INTO v_topic_id FROM questions WHERE id = NEW.question_id;

  -- Inserir ou atualizar diagnóstico
  INSERT INTO topic_diagnostics (user_id, topic_id, total_attempts, correct_count, calc_errors, concept_errors, interpretation_errors)
  VALUES (
    NEW.user_id,
    v_topic_id,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    CASE WHEN NEW.mistake_type = 'calculo' THEN 1 ELSE 0 END,
    CASE WHEN NEW.mistake_type = 'conceito' THEN 1 ELSE 0 END,
    CASE WHEN NEW.mistake_type = 'interpretacao' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, topic_id) DO UPDATE SET
    total_attempts = topic_diagnostics.total_attempts + 1,
    correct_count = topic_diagnostics.correct_count + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    calc_errors = topic_diagnostics.calc_errors + CASE WHEN NEW.mistake_type = 'calculo' THEN 1 ELSE 0 END,
    concept_errors = topic_diagnostics.concept_errors + CASE WHEN NEW.mistake_type = 'conceito' THEN 1 ELSE 0 END,
    interpretation_errors = topic_diagnostics.interpretation_errors + CASE WHEN NEW.mistake_type = 'interpretacao' THEN 1 ELSE 0 END,
    last_activity_at = NOW(),
    updated_at = NOW();

  -- Atualizar nível de maestria
  UPDATE topic_diagnostics
  SET mastery_level = CASE
    WHEN total_attempts < 5 THEN 'unknown'
    WHEN accuracy_rate >= 90 THEN 'mastered'
    WHEN accuracy_rate >= 75 THEN 'proficient'
    WHEN accuracy_rate >= 50 THEN 'developing'
    ELSE 'weak'
  END,
  weakness_identified = CASE WHEN total_attempts >= 10 AND accuracy_rate < 60 THEN TRUE ELSE weakness_identified END
  WHERE user_id = NEW.user_id AND topic_id = v_topic_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_diagnostic
  AFTER INSERT ON student_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_diagnostic();
```

---

## Tipos TypeScript

**Arquivo:** `src/types/question.types.ts`

```typescript
// ============================================
// ENUMS
// ============================================

export type KnowledgeArea = 'linguagens' | 'humanas' | 'natureza' | 'matematica'

export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'muito_dificil'

export type MasteryLevel = 'unknown' | 'weak' | 'developing' | 'proficient' | 'mastered'

export type MistakeType = 'conceito' | 'calculo' | 'interpretacao' | 'desatencao' | 'tempo'

export type SessionType = 'topic_focus' | 'mixed' | 'weakness_review' | 'simulation'

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'

export type AnswerOption = 'A' | 'B' | 'C' | 'D' | 'E'

// ============================================
// ENTIDADES
// ============================================

export interface Subject {
  id: string
  area: KnowledgeArea
  name: string
  code: string
  description?: string
  created_at: string
}

export interface Topic {
  id: string
  subject_id: string
  name: string
  code: string
  description?: string
  parent_topic_id?: string
  importance_weight: number
  created_at: string
}

export interface Question {
  id: string
  year: number
  edition?: string
  question_number?: number
  subject_id: string
  topic_id: string
  secondary_topic_id?: string
  difficulty: DifficultyLevel
  statement: string
  support_text?: string
  image_url?: string
  image_description?: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  option_e: string
  correct_answer: AnswerOption
  explanation: string
  common_mistakes?: CommonMistake[]
  key_concepts?: string[]
  tri_difficulty?: number
  tri_discrimination?: number
  tri_guessing?: number
  skills?: string[]
  competencies?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CommonMistake {
  option: AnswerOption
  reason: string
  indicates: MistakeType
}

export interface StudentAnswer {
  id: string
  user_id: string
  question_id: string
  selected_answer: AnswerOption
  is_correct: boolean
  time_spent_seconds?: number
  confidence_level?: number
  mistake_type?: MistakeType
  mistake_analysis?: string
  practice_session_id?: string
  created_at: string
}

export interface TopicDiagnostic {
  id: string
  user_id: string
  topic_id: string
  total_attempts: number
  correct_count: number
  accuracy_rate: number
  calc_errors: number
  concept_errors: number
  interpretation_errors: number
  mastery_level: MasteryLevel
  weakness_identified: boolean
  weakness_description?: string
  recommended_review: boolean
  intervention_delivered: boolean
  last_activity_at: string
  created_at: string
  updated_at: string
}

export interface PracticeSession {
  id: string
  user_id: string
  session_type: SessionType
  subject_id?: string
  topic_id?: string
  total_questions: number
  correct_answers: number
  accuracy_rate?: number
  total_time_seconds?: number
  status: SessionStatus
  started_at: string
  completed_at?: string
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface QuestionWithTopic extends Question {
  topic: Topic
  subject: Subject
}

export interface AnswerSubmission {
  question_id: string
  selected_answer: AnswerOption
  time_spent_seconds?: number
  confidence_level?: number
  practice_session_id?: string
}

export interface AnswerResult {
  is_correct: boolean
  correct_answer: AnswerOption
  explanation: string
  mistake_type?: MistakeType
  mistake_analysis?: string
}

export interface DiagnosticSummary {
  topic: Topic
  diagnostic: TopicDiagnostic
  recommendation?: string
}

// ============================================
// CONSTANTES DE DIAGNÓSTICO
// ============================================

export const DIAGNOSIS_THRESHOLDS = {
  MIN_QUESTIONS_FOR_DIAGNOSIS: 10,
  WEAKNESS_ACCURACY: 60,      // < 60% = fraqueza
  PROFICIENT_ACCURACY: 75,    // >= 75% = proficiente
  MASTERED_ACCURACY: 90,      // >= 90% = dominado
  MIN_FOR_MASTERY_LEVEL: 5,   // Mínimo para calcular nível
} as const

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  unknown: 'Dados insuficientes',
  weak: 'Precisa de reforço',
  developing: 'Em desenvolvimento',
  proficient: 'Proficiente',
  mastered: 'Dominado',
}

export const MISTAKE_TYPE_LABELS: Record<MistakeType, string> = {
  conceito: 'Erro Conceitual',
  calculo: 'Erro de Cálculo',
  interpretacao: 'Erro de Interpretação',
  desatencao: 'Desatenção',
  tempo: 'Falta de Tempo',
}
```

---

## Implementação: Server Actions

### Arquivo: `src/app/actions/questions.ts`

```typescript
'use server'

import { createClient } from "@/lib/supabase/server"
import type {
  Question,
  QuestionWithTopic,
  AnswerSubmission,
  AnswerResult,
  MistakeType
} from "@/types/question.types"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ============================================
// BUSCAR QUESTÃO
// ============================================

export async function getRandomQuestion(
  subjectCode?: string,
  topicCode?: string,
  difficulty?: string
): Promise<QuestionWithTopic | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  let query = supabase
    .from('questions')
    .select(`
      *,
      topic:topics(*),
      subject:subjects(*)
    `)
    .eq('is_active', true)

  if (subjectCode) {
    const { data: subject } = await supabase
      .from('subjects')
      .select('id')
      .eq('code', subjectCode)
      .single()

    if (subject) query = query.eq('subject_id', subject.id)
  }

  if (topicCode) {
    const { data: topic } = await supabase
      .from('topics')
      .select('id')
      .eq('code', topicCode)
      .single()

    if (topic) query = query.eq('topic_id', topic.id)
  }

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  // Excluir questões já respondidas na sessão atual
  const { data: answeredIds } = await supabase
    .from('student_answers')
    .select('question_id')
    .eq('user_id', user.id)

  if (answeredIds && answeredIds.length > 0) {
    const ids = answeredIds.map(a => a.question_id)
    query = query.not('id', 'in', `(${ids.join(',')})`)
  }

  const { data, error } = await query.limit(50)

  if (error || !data || data.length === 0) return null

  // Retorna questão aleatória
  const randomIndex = Math.floor(Math.random() * data.length)
  return data[randomIndex] as QuestionWithTopic
}

// ============================================
// SUBMETER RESPOSTA
// ============================================

export async function submitAnswer(
  submission: AnswerSubmission
): Promise<AnswerResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Buscar questão
  const { data: question, error: qError } = await supabase
    .from('questions')
    .select('*')
    .eq('id', submission.question_id)
    .single()

  if (qError || !question) throw new Error("Questão não encontrada")

  const is_correct = submission.selected_answer === question.correct_answer

  let mistake_type: MistakeType | undefined
  let mistake_analysis: string | undefined

  // Se errou, analisar o tipo de erro com IA
  if (!is_correct) {
    const analysis = await analyzeMistake(
      question,
      submission.selected_answer,
      question.correct_answer
    )
    mistake_type = analysis.type
    mistake_analysis = analysis.analysis
  }

  // Salvar resposta
  const { error: insertError } = await supabase
    .from('student_answers')
    .insert({
      user_id: user.id,
      question_id: submission.question_id,
      selected_answer: submission.selected_answer,
      is_correct,
      time_spent_seconds: submission.time_spent_seconds,
      confidence_level: submission.confidence_level,
      mistake_type,
      mistake_analysis,
      practice_session_id: submission.practice_session_id
    })

  if (insertError) throw new Error(insertError.message)

  return {
    is_correct,
    correct_answer: question.correct_answer,
    explanation: question.explanation,
    mistake_type,
    mistake_analysis
  }
}

// ============================================
// ANÁLISE DE ERRO COM IA
// ============================================

const MISTAKE_ANALYZER_PROMPT = `
Você é um diagnosticador de erros em questões do ENEM.
Analise o erro do aluno e classifique em uma das categorias:
- "conceito": O aluno não domina o conceito teórico necessário
- "calculo": O aluno entende o conceito mas errou na execução/cálculo
- "interpretacao": O aluno não interpretou corretamente o enunciado
- "desatencao": Erro simples por falta de atenção aos detalhes

Retorne JSON estrito:
{
  "type": "conceito" | "calculo" | "interpretacao" | "desatencao",
  "analysis": "Explicação breve e técnica do erro cometido"
}
`

async function analyzeMistake(
  question: Question,
  selectedAnswer: string,
  correctAnswer: string
): Promise<{ type: MistakeType; analysis: string }> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-05-20",
    generationConfig: { responseMimeType: "application/json" }
  })

  const prompt = `
QUESTÃO: ${question.statement}
RESPOSTA CORRETA: ${correctAnswer}
RESPOSTA DO ALUNO: ${selectedAnswer}
ALTERNATIVA ESCOLHIDA: ${question[`option_${selectedAnswer.toLowerCase()}` as keyof Question]}
ALTERNATIVA CORRETA: ${question[`option_${correctAnswer.toLowerCase()}` as keyof Question]}
`

  try {
    const result = await model.generateContent([MISTAKE_ANALYZER_PROMPT, prompt])
    const responseText = result.response.text()
    return JSON.parse(responseText)
  } catch {
    return {
      type: 'conceito',
      analysis: 'Não foi possível analisar o erro automaticamente.'
    }
  }
}

// ============================================
// BUSCAR DIAGNÓSTICO DO USUÁRIO
// ============================================

export async function getUserDiagnostics() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('topic_diagnostics')
    .select(`
      *,
      topic:topics(
        *,
        subject:subjects(*)
      )
    `)
    .eq('user_id', user.id)
    .order('accuracy_rate', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

// ============================================
// BUSCAR FRAQUEZAS IDENTIFICADAS
// ============================================

export async function getIdentifiedWeaknesses() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('topic_diagnostics')
    .select(`
      *,
      topic:topics(
        *,
        subject:subjects(*)
      )
    `)
    .eq('user_id', user.id)
    .eq('weakness_identified', true)
    .order('accuracy_rate', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}
```

---

## Implementação: Frontend

### Página de Prática: `src/app/pratica/page.tsx`

```typescript
'use client'

import Link from 'next/link'

const SUBJECTS = [
  { code: 'MAT', name: 'Matemática', color: 'bg-blue-600', icon: '📐' },
  { code: 'FIS', name: 'Física', color: 'bg-purple-600', icon: '⚡' },
  { code: 'QUI', name: 'Química', color: 'bg-green-600', icon: '🧪' },
  { code: 'BIO', name: 'Biologia', color: 'bg-emerald-600', icon: '🧬' },
  { code: 'POR', name: 'Português', color: 'bg-red-600', icon: '📚' },
  { code: 'HIS', name: 'História', color: 'bg-amber-600', icon: '🏛️' },
  { code: 'GEO', name: 'Geografia', color: 'bg-cyan-600', icon: '🌍' },
]

export default function PraticaPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-2 tracking-tighter">
        MILLE AI <span className="text-red-600">QUESTÕES</span>
      </h1>
      <p className="text-gray-400 mb-8">
        Banco de questões clássicas do ENEM. Escolha uma disciplina.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {SUBJECTS.map((subject) => (
          <Link
            key={subject.code}
            href={`/pratica/${subject.code.toLowerCase()}`}
            className={`${subject.color} hover:opacity-90 p-6 rounded-lg
                       transition-all flex flex-col items-center justify-center
                       text-center h-32`}
          >
            <span className="text-3xl mb-2">{subject.icon}</span>
            <span className="font-bold">{subject.name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 border border-zinc-800 rounded-lg">
        <h2 className="font-bold text-lg mb-2">Como funciona</h2>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Responda questões do ENEM de 2009 a 2024</li>
          <li>• O sistema rastreia seu desempenho por tópico</li>
          <li>• Após 10+ questões, fraquezas são identificadas</li>
          <li>• Erros são classificados: conceito, cálculo ou interpretação</li>
        </ul>
      </div>
    </div>
  )
}
```

### Componente de Questão: `src/components/questions/QuestionCard.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { QuestionWithTopic, AnswerOption, AnswerResult } from '@/types/question.types'
import { submitAnswer } from '@/app/actions/questions'

interface Props {
  question: QuestionWithTopic
  sessionId?: string
  onNext: () => void
}

const OPTIONS: AnswerOption[] = ['A', 'B', 'C', 'D', 'E']

export function QuestionCard({ question, sessionId, onNext }: Props) {
  const [selected, setSelected] = useState<AnswerOption | null>(null)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [startTime] = useState(Date.now())

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)

    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    try {
      const answerResult = await submitAnswer({
        question_id: question.id,
        selected_answer: selected,
        time_spent_seconds: timeSpent,
        practice_session_id: sessionId
      })
      setResult(answerResult)
    } catch (error) {
      console.error('Erro ao submeter:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOptionText = (opt: AnswerOption): string => {
    return question[`option_${opt.toLowerCase()}` as keyof typeof question] as string
  }

  const getOptionStyle = (opt: AnswerOption): string => {
    if (!result) {
      return selected === opt
        ? 'border-red-500 bg-red-500/10'
        : 'border-zinc-700 hover:border-zinc-500'
    }
    if (opt === result.correct_answer) return 'border-green-500 bg-green-500/10'
    if (opt === selected && !result.is_correct) return 'border-red-500 bg-red-500/10'
    return 'border-zinc-800 opacity-50'
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span className="px-2 py-1 bg-zinc-800 rounded">{question.subject.name}</span>
        <span className="px-2 py-1 bg-zinc-800 rounded">{question.topic.name}</span>
        <span className="px-2 py-1 bg-zinc-800 rounded">ENEM {question.year}</span>
      </div>

      {/* Texto de apoio */}
      {question.support_text && (
        <div className="text-gray-300 text-sm mb-4 p-4 bg-zinc-800/50 rounded border-l-2 border-zinc-600">
          {question.support_text}
        </div>
      )}

      {/* Enunciado */}
      <p className="text-white mb-6 leading-relaxed">{question.statement}</p>

      {/* Alternativas */}
      <div className="space-y-3 mb-6">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => !result && setSelected(opt)}
            disabled={!!result}
            className={`w-full text-left p-4 border rounded-lg transition-all
                       flex items-start gap-3 ${getOptionStyle(opt)}`}
          >
            <span className="font-bold text-gray-400">{opt})</span>
            <span className="text-gray-200">{getOptionText(opt)}</span>
          </button>
        ))}
      </div>

      {/* Botão de confirmar ou resultado */}
      {!result ? (
        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700
                     disabled:cursor-not-allowed text-white font-bold py-4
                     rounded-lg transition-all"
        >
          {loading ? 'VERIFICANDO...' : 'CONFIRMAR RESPOSTA'}
        </button>
      ) : (
        <div className="space-y-4">
          {/* Resultado */}
          <div className={`p-4 rounded-lg ${
            result.is_correct ? 'bg-green-500/10 border border-green-500' : 'bg-red-500/10 border border-red-500'
          }`}>
            <p className="font-bold mb-2">
              {result.is_correct ? '✓ CORRETO!' : '✗ INCORRETO'}
            </p>
            {!result.is_correct && result.mistake_analysis && (
              <div className="text-sm">
                <p className="text-gray-400 mb-1">
                  Tipo de erro: <span className="text-white">{result.mistake_type}</span>
                </p>
                <p className="text-gray-300">{result.mistake_analysis}</p>
              </div>
            )}
          </div>

          {/* Explicação */}
          <div className="p-4 bg-zinc-800 rounded-lg">
            <p className="font-bold text-sm text-gray-400 mb-2">EXPLICAÇÃO</p>
            <p className="text-gray-200 text-sm">{result.explanation}</p>
          </div>

          {/* Próxima questão */}
          <button
            onClick={onNext}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white
                       font-bold py-4 rounded-lg transition-all"
          >
            PRÓXIMA QUESTÃO →
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## Checklist de Validação (Fase 2)

### Banco de Dados
- [ ] Tabelas criadas no Supabase (subjects, topics, questions, student_answers, topic_diagnostics, practice_sessions)
- [ ] Tópicos inseridos para todas as disciplinas
- [ ] RLS configurado corretamente
- [ ] Trigger de atualização de diagnóstico funcionando

### Questões
- [ ] Pelo menos 50 questões de teste inseridas
- [ ] Questões com todos os campos obrigatórios preenchidos
- [ ] Explicações de qualidade para cada questão

### Funcionalidade
- [ ] Busca de questão aleatória funcionando
- [ ] Submissão de resposta salvando no banco
- [ ] Análise de erro com IA retornando classificação
- [ ] Diagnóstico sendo atualizado automaticamente pelo trigger

### Diagnóstico
- [ ] Após 10+ questões em um tópico, fraqueza é identificada se acurácia < 60%
- [ ] Níveis de maestria atualizando corretamente
- [ ] Contagem de tipos de erro (conceito/cálculo/interpretação) funcionando

### UX
- [ ] Interface de seleção de disciplina
- [ ] Card de questão com alternativas clicáveis
- [ ] Feedback visual de acerto/erro
- [ ] Loading states durante operações

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
- Componentes: PascalCase (`QuestionCard.tsx`)
- Funções/variáveis: camelCase (`submitAnswer`, `questionId`)
- Constantes: SCREAMING_SNAKE_CASE (`DIAGNOSIS_THRESHOLDS`)
- Types/Interfaces: PascalCase (`QuestionWithTopic`)
- Códigos de tópico: UPPER_SNAKE_CASE (`MAT_FUNC`, `FIS_CINEM`)

### Estrutura de Arquivos
- Server Actions: `src/app/actions/`
- Componentes de Questão: `src/components/questions/`
- Tipos: `src/types/`

### Estilo
- Design system: "Industrial-Dark" (fundo preto, acentos vermelhos)
- Feedback positivo: verde (`green-500`)
- Feedback negativo: vermelho (`red-500`)
- Elementos neutros: cinza (`zinc-800`, `gray-400`)

---

## Notas Importantes

1. **Trigger Automático:** O diagnóstico é atualizado automaticamente via trigger PostgreSQL a cada resposta
2. **Análise de Erro:** A IA classifica erros em 4 tipos para diagnóstico preciso
3. **Mínimo para Diagnóstico:** 10 questões por tópico para identificar fraquezas
4. **RLS Ativo:** Usuários só acessam seus próprios dados
5. **Zero-Fluff Policy:** Feedback técnico e direto, sem mensagens motivacionais
