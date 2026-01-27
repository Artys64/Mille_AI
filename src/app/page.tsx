import { Button } from "@/components/ui/button"
import { FileText, Calendar, BookOpen, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-lg">Mille AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#pilares" className="hover:text-foreground transition-colors">
              Pilares
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Planos
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
            <Button size="sm">
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Tecnologia de elite para todos
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Pare de pagar caro por cursinho.
            <br />
            <span className="text-muted-foreground">Estude com precisão cirúrgica.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            O Mille AI usa inteligência artificial para identificar exatamente onde você precisa
            melhorar e criar um plano de estudos personalizado. Sem enrolação, sem conteúdo genérico.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gap-2">
              Fazer diagnóstico grátis
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg">
              Ver demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold">1/10</div>
              <div className="text-sm text-muted-foreground">do custo de um cursinho</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">disponível para estudar</div>
            </div>
            <div>
              <div className="text-3xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">competências ENEM analisadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">enrolação ou conteúdo genérico</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares Section */}
      <section id="pilares" className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Os Três Pilares</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cada funcionalidade foi projetada para maximizar seu aproveitamento em menos tempo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Pilar 1: O Auditor */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">O Auditor</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Correção de redações no modo estrito. Sem arredondamentos amigáveis,
              análise técnica das 5 competências do ENEM com feedback detalhado.
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
                Análise das 5 competências ENEM
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
                Identificação de erros gramaticais
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
                Sugestões de melhoria específicas
              </li>
            </ul>
          </div>

          {/* Pilar 2: Roadmap Dinâmico */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Roadmap Dinâmico</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Seu cronograma é recalculado diariamente baseado na sua performance.
              Identificamos lacunas e pivotamos automaticamente.
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Recálculo diário de prioridades
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Otimização TRI (Teoria de Resposta ao Item)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Foco em custo de oportunidade
              </li>
            </ul>
          </div>

          {/* Pilar 3: Educação Cirúrgica */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Educação Cirúrgica</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Micro-aulas sob demanda ao invés de videoaulas de 60 minutos.
              Aprenda apenas o que você ainda não domina.
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Conteúdo baseado em lacunas reais
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Mapas mentais e flashcards
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Exercícios resolvidos direcionados
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para estudar com precisão?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Porque no dia da prova, a sua única vantagem é ter sido auditado pela melhor tecnologia.
          </p>
          <Button size="lg" className="gap-2">
            Começar agora gratuitamente
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">M</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Mille AI - Educação Data-Driven
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Feito no Ceará com metodologias de aprovação comprovadas.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
