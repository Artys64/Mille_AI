'use client'

import { auditEssayAndRedirect } from '@/app/actions/audit'
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed
                 text-white font-bold py-4 rounded-lg transition-all uppercase tracking-wider"
    >
      {pending ? "AUDITANDO..." : "INICIAR AUDITORIA RIGOROSA"}
    </button>
  )
}

async function handleAudit(_prevState: string | null, formData: FormData): Promise<string | null> {
  try {
    await auditEssayAndRedirect(formData)
    return null
  } catch (error) {
    if (error instanceof Error) {
      return error.message
    }
    return "Erro desconhecido. Tente novamente."
  }
}

export default function AuditorPage() {
  const [error, formAction] = useActionState(handleAudit, null)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            &larr; Voltar
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-tighter">
          MILLE AI <span className="text-red-600">AUDITOR</span>
        </h1>
        <p className="text-zinc-400 mb-8">
          Strict Mode: Active. Prepare-se para a verdade.
        </p>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-950 border border-red-800 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Erro na auditoria</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="essay" className="block text-sm font-medium text-zinc-400 mb-2">
              Cole sua redação abaixo (mínimo 7 linhas)
            </label>
            <textarea
              id="essay"
              name="essay"
              placeholder="Cole sua redação aqui...

O texto deve ter no mínimo 7 linhas para uma análise válida.
Serão avaliadas as 5 competências do ENEM:
- C1: Domínio da norma culta
- C2: Compreensão do tema
- C3: Argumentação
- C4: Coesão textual
- C5: Proposta de intervenção"
              className="w-full h-96 p-4 bg-zinc-900 border border-zinc-800
                       rounded-lg focus:border-red-500 focus:ring-1
                       focus:ring-red-500 text-gray-200 outline-none
                       resize-none font-mono text-sm leading-relaxed
                       placeholder:text-zinc-600"
              required
              minLength={50}
            />
          </div>

          <SubmitButton />
        </form>

        {/* Info Footer */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">O que esperar:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-500">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              Análise das 5 competências ENEM
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              Nota de 0 a 1000 sem arredondamentos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              Feedback técnico e direto
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              Plano de ação específico
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
