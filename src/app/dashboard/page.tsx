import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FileText, Target, AlertCircle, ArrowRight } from "lucide-react"

interface Competency {
  score: number
  errors?: string
  analysis?: string
  gaps?: string
  connectives?: string
  details?: string
}

interface Breakdown {
  c1: Competency
  c2: Competency
  c3: Competency
  c4: Competency
  c5: Competency
}

interface Correction {
  id: string
  user_id: string
  essay_text: string
  total_score: number
  breakdown: Breakdown
  strict_feedback: string
  action_plan: string
  created_at: string
}

const COMPETENCY_NAMES: Record<string, string> = {
  c1: "Domínio da Norma Culta",
  c2: "Compreensão do Tema",
  c3: "Argumentação",
  c4: "Coesão Textual",
  c5: "Proposta de Intervenção"
}

function getScoreColor(score: number): string {
  if (score >= 160) return "text-green-500"
  if (score >= 120) return "text-yellow-500"
  if (score >= 80) return "text-orange-500"
  return "text-red-500"
}

function getScoreBgColor(score: number): string {
  if (score >= 160) return "bg-green-500/20"
  if (score >= 120) return "bg-yellow-500/20"
  if (score >= 80) return "bg-orange-500/20"
  return "bg-red-500/20"
}

function getTotalScoreColor(score: number): string {
  if (score >= 800) return "text-green-500"
  if (score >= 600) return "text-yellow-500"
  if (score >= 400) return "text-orange-500"
  return "text-red-500"
}

function RadarChart({ breakdown }: { breakdown: Breakdown }) {
  const competencies = ['c1', 'c2', 'c3', 'c4', 'c5'] as const
  const centerX = 100
  const centerY = 100
  const maxRadius = 80

  const points = competencies.map((c, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    const score = breakdown[c].score
    const radius = (score / 200) * maxRadius
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      labelX: centerX + (maxRadius + 20) * Math.cos(angle),
      labelY: centerY + (maxRadius + 20) * Math.sin(angle),
      score
    }
  })

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ')

  // Grid circles
  const gridLevels = [40, 80, 120, 160, 200]

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-xs mx-auto">
      {/* Grid circles */}
      {gridLevels.map(level => {
        const radius = (level / 200) * maxRadius
        return (
          <circle
            key={level}
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="rgb(39 39 42)"
            strokeWidth="1"
          />
        )
      })}

      {/* Grid lines */}
      {competencies.map((_, i) => {
        const angle = (i * 72 - 90) * (Math.PI / 180)
        const endX = centerX + maxRadius * Math.cos(angle)
        const endY = centerY + maxRadius * Math.sin(angle)
        return (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={endX}
            y2={endY}
            stroke="rgb(39 39 42)"
            strokeWidth="1"
          />
        )
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="rgba(220, 38, 38, 0.3)"
        stroke="rgb(220, 38, 38)"
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="rgb(220, 38, 38)"
        />
      ))}

      {/* Labels */}
      {competencies.map((c, i) => {
        const angle = (i * 72 - 90) * (Math.PI / 180)
        const labelX = centerX + (maxRadius + 15) * Math.cos(angle)
        const labelY = centerY + (maxRadius + 15) * Math.sin(angle)
        return (
          <text
            key={c}
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[8px] fill-zinc-400 font-medium"
          >
            {c.toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
}

function CompetencyCard({ id, competency }: { id: string; competency: Competency }) {
  const feedback = competency.errors || competency.analysis || competency.gaps || competency.connectives || competency.details || ''

  return (
    <div className={`p-4 rounded-lg border border-zinc-800 ${getScoreBgColor(competency.score)}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-300">{COMPETENCY_NAMES[id]}</span>
        <span className={`text-lg font-bold ${getScoreColor(competency.score)}`}>
          {competency.score}/200
        </span>
      </div>
      <p className="text-sm text-zinc-400">{feedback}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/")
  }

  const { data: corrections, error } = await supabase
    .from("corrections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)

  if (error) {
    console.error("Error fetching corrections:", error)
  }

  const latestCorrection = corrections?.[0] as Correction | undefined

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard de <span className="text-red-600">Correções</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Histórico e análise de suas redações
            </p>
          </div>
          <a
            href="/auditor"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            Nova Auditoria
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {!latestCorrection ? (
          /* Empty State */
          <div className="text-center py-24 border border-dashed border-zinc-800 rounded-lg">
            <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-zinc-300 mb-2">
              Nenhuma correção encontrada
            </h2>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">
              Envie sua primeira redação para receber uma análise detalhada das 5 competências do ENEM.
            </p>
            <a
              href="/auditor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
            >
              Começar Auditoria
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          /* Results Display */
          <div className="space-y-8">
            {/* Score Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Total Score */}
              <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-sm text-zinc-400">Nota Final</span>
                </div>
                <div className={`text-5xl font-bold ${getTotalScoreColor(latestCorrection.total_score)}`}>
                  {latestCorrection.total_score}
                </div>
                <div className="text-sm text-zinc-500 mt-1">de 1000 pontos</div>
              </div>

              {/* Radar Chart */}
              <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800 lg:col-span-2">
                <h3 className="text-sm font-medium text-zinc-400 mb-4">Distribuição por Competência</h3>
                <RadarChart breakdown={latestCorrection.breakdown} />
              </div>
            </div>

            {/* Strict Feedback */}
            <div className="p-6 bg-red-950/50 rounded-lg border border-red-900/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-400 mb-1">Feedback Direto</h3>
                  <p className="text-red-200">{latestCorrection.strict_feedback}</p>
                </div>
              </div>
            </div>

            {/* Action Plan */}
            <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Plano de Ação</h3>
              <p className="text-zinc-200">{latestCorrection.action_plan}</p>
            </div>

            {/* Competencies Breakdown */}
            <div>
              <h3 className="text-lg font-medium text-zinc-200 mb-4">Análise por Competência</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['c1', 'c2', 'c3', 'c4', 'c5'] as const).map(c => (
                  <CompetencyCard key={c} id={c} competency={latestCorrection.breakdown[c]} />
                ))}
              </div>
            </div>

            {/* Original Text */}
            <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Texto Original</h3>
              <div className="p-4 bg-black rounded-lg border border-zinc-800">
                <p className="text-zinc-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {latestCorrection.essay_text}
                </p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-center text-sm text-zinc-500">
              Auditoria realizada em {new Date(latestCorrection.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
