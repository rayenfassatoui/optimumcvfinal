# Project Context

## Purpose
Optimum CV is an AI-powered application designed to help students and job seekers automate the tedious process of finding and applying for jobs and internships (PFE). The app streamlines profile creation, resume generation, and application submission.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Auth**: Better-auth
- **Package Manager**: Bun
- **AI**: (To be determined/integrated) for resume parsing and generation

## Project Conventions

### Code Style
- **Naming**:
    - Functions: camelCase
    - Components: PascalCase
    - Files: kebab-case
- **Types**: Strict TypeScript, avoid `any`.
- **Architecture**: Feature-Driven (Vertical Slices)
    - `features/[feature-name]/`: Domain logic
    - `components/ui/`: Generic primitives
    - `app/`: Routing layer
    - `lib/`: Shared utilities

### Architecture Patterns
- Feature-Driven Architecture.
- Server Actions for mutations.
- Client components only where interactivity is needed.

### Testing Strategy
- (To be defined)

### Git Workflow
- (To be defined)

## Domain Context
- **PFE**: "Projet de Fin d'Études" (End of Studies Project), a graduation internship common in engineering schools.
- **PFE Book**: A PDF document released by companies containing a list of available internship topics.
- **ATS**: Applicant Tracking System.

## Important Constraints
- User data must be securely stored.
- Resume generation must be high quality (Harvard style).

## External Dependencies
- OpenRouter API (for AI features)
- PDF Parsing libraries
