import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mille AI - Tutoria Inteligente para Vestibulares",
  description:
    "Plataforma de tutoria inteligente com IA para preparação de vestibulares. ENEM, Medicina, ITA/IME e mais.",
  keywords: [
    "ENEM",
    "vestibular",
    "medicina",
    "ITA",
    "IME",
    "cursinho",
    "IA",
    "inteligência artificial",
    "educação",
  ],
  authors: [{ name: "Mille AI" }],
  openGraph: {
    title: "Mille AI - Tutoria Inteligente para Vestibulares",
    description:
      "Plataforma de tutoria inteligente com IA para preparação de vestibulares.",
    type: "website",
    locale: "pt_BR",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
