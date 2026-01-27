# CLAUDE.md - AI Assistant Guide for Mille AI

## Project Overview

**Mille AI** is a high-performance educational technology platform designed to disrupt traditional Brazilian exam preparation (cursinhos). It's an AI-powered tutoring system targeting highly competitive exams:
- **ENEM** (National secondary education exam)
- **Medicine entrance exams**
- **ITA/IME** (Military engineering institutes)
- **UFC** (Federal University of Ceará medical school)

### Current Status
The project is in the **early specification/planning phase**. The README.md contains the complete product specification, but implementation has not yet begun.

---

## Tech Stack (Planned MVP)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **AI Engine** | Gemini 2.5 Flash | Near-zero latency, robust free context processing |
| **Framework** | Next.js 14 | Performance and scalability |
| **Backend/Database** | Supabase | Real-time data management and secure authentication |
| **Design System** | Tailwind CSS + Shadcn | "Industrial-Dark" UI focused on productivity |

---

## Project Architecture (Three Core Pillars)

### 1. The Auditor (Elite Correction)
- Strict-mode grading using Gemini 2.5 Flash
- Essay auditing based on 5 ENEM competencies
- STEM error identification (conceptual vs. computational)
- No "friendly rounding" - technical precision required

### 2. Dynamic Roadmap (Real-Time Scheduling)
- Daily curriculum recalculation based on performance
- Automatic schedule pivots when knowledge gaps are identified
- TRI (Item Response Theory) optimization
- Not fixed-schedule based

### 3. Surgical Education (Personalized Learning)
- On-demand micro-lessons instead of 60-minute classes
- Content delivery based on actual knowledge gaps
- Formats: mental maps, flashcards, solved exercises
- "Learn only what you don't master"

---

## Core Algorithm: Opportunity Cost

```
CO = T_remaining / (W_subject × G_performance)
```

Where:
- **W_subject**: Subject weight for chosen course (e.g., Biology for Medicine)
- **G_performance**: Points gap (Cut-off Score - Current Score)
- **T_remaining**: Days until exam

---

## Development Roadmap

- [x] **Phase 1**: Essay grading engine (The Auditor - Strict Mode)
- [ ] **Phase 2**: STEM diagnostics via handwriting OCR
- [ ] **Phase 3**: Adaptive scheduling algorithm + micro-lesson library
- [ ] **Phase 4**: Predictive simulations based on real TRI

---

## Development Conventions

### Language & Documentation
- Primary language: **Portuguese (Brazilian)** for user-facing content
- Code comments and technical documentation: **English**
- Variable/function names: **English**

### Code Style (When Implementation Begins)

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Prefer functional components with React hooks
- Use `camelCase` for variables and functions
- Use `PascalCase` for components and types
- Use `SCREAMING_SNAKE_CASE` for constants

#### File Organization (Expected Structure)
```
src/
├── app/              # Next.js 14 App Router pages
├── components/       # Reusable UI components
│   ├── ui/           # Shadcn components
│   └── features/     # Feature-specific components
├── lib/              # Utility functions and configurations
│   ├── supabase/     # Supabase client and helpers
│   └── gemini/       # Gemini API integration
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── styles/           # Global styles and Tailwind config
```

#### Naming Conventions
- Components: `ComponentName.tsx`
- Hooks: `use-hook-name.ts`
- Utilities: `utility-name.ts`
- Types: `type-name.types.ts`

### Tailwind CSS
- Follow "Industrial-Dark" design theme
- Prioritize productivity and focus in UI design
- Use Shadcn components as base
- Maintain consistency with design system

### Supabase
- Use Row Level Security (RLS) for all tables
- Prefer database functions for complex operations
- Keep authentication logic centralized

### Gemini Integration
- Handle API errors gracefully
- Implement rate limiting
- Cache responses where appropriate
- Maintain "Strict Mode" for all grading operations

---

## Business Rules

### Zero-Fluff Policy
- No motivational fluff content
- Technical density focus
- Every feature must provide measurable value

### Asymmetric Value Principle
- Elite technology at 1/10th cursinho cost
- Maximize value per interaction
- Prioritize student outcomes over engagement metrics

### The Ceará DNA
- Algorithms trained on Brazil's best approval methodologies
- Focus on proven study techniques
- Data-driven decision making

---

## Git Workflow

### Branch Naming
- Features: `feature/description`
- Fixes: `fix/description`
- Claude sessions: `claude/claude-md-*`

### Commit Messages
- Use clear, descriptive messages
- Reference issue numbers when applicable
- Keep commits atomic and focused

### Current Repository Info
- **Author**: Mateus Tanimoto (tanimotoaquino@gmail.com)
- **Signed commits**: Enabled with SSH key signing

---

## Environment Setup (When Implementation Begins)

### Required Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development Commands (Expected)
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run test         # Run tests
```

---

## AI Assistant Guidelines

### When Working on This Codebase

1. **Respect the Zero-Fluff Policy** - Keep implementations focused and technically dense
2. **Maintain Strict Mode** - The Auditor feature requires uncompromising precision
3. **Consider TRI Optimization** - Study scheduling must follow Item Response Theory principles
4. **Portuguese User Content** - User-facing strings should be in Brazilian Portuguese
5. **Performance First** - Latency is critical for real-time study adjustments

### Key Considerations
- This is an EdTech startup project with specific educational methodology
- The target audience is highly competitive exam students
- Every feature should contribute to the "Opportunity Cost" optimization
- The platform replaces expensive traditional courses, so value delivery is paramount

### Before Implementation
- Verify tech stack decisions haven't changed
- Check README.md for any roadmap updates
- Ensure new features align with the three core pillars

---

## Useful Commands

```bash
# Check project status
git status

# View recent changes
git log --oneline -10

# Start development (when setup complete)
npm run dev
```

---

## Contact & Contribution

This is a **Data-Driven** project focused on making education scalable, fair, and efficient.

**Mille AI** — "Porque no dia da prova, a sua única vantagem é ter sido auditado pela melhor tecnologia."
