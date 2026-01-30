'use client'

import { signIn } from '@/app/actions/auth'
import Link from 'next/link'
import { useState, useTransition } from 'react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tighter">
            MILLE <span className="text-red-600">AI</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Auditoria de Elite para Aprovação
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Login</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700
                           rounded-lg focus:border-red-500 focus:ring-1
                           focus:ring-red-500 text-white outline-none"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700
                           rounded-lg focus:border-red-500 focus:ring-1
                           focus:ring-red-500 text-white outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800
                         text-white font-bold py-3 rounded-lg transition-all"
            >
              {isPending ? "ENTRANDO..." : "ENTRAR"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Não tem conta?{' '}
              <Link href="/signup" className="text-red-600 hover:text-red-500 font-semibold">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}