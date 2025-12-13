# OptimumCV

A modern CV/Resume and PFE (Projet de Fin d'Études) application management platform built with Next.js 16, Better-Auth, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better-Auth (OAuth with Google, GitHub)
- **Package Manager**: Bun
- **AI Integration**: OpenRouter API

## Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** 20+ (or use Bun as your runtime)
- **Bun** (recommended) - [Install Bun](https://bun.sh)
- **PostgreSQL** (local installation via Homebrew or cloud service like Neon)
  ```bash
  # For macOS with Homebrew
  brew install postgresql@16
  brew services start postgresql@16
  ```

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd optimum-v2

# Install dependencies
bun install
```

### 2. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL (Homebrew on macOS)

```bash
# Create the database
createdb optimumcv

# Verify it was created
psql -l
```

#### Option B: Cloud Database (Neon, Supabase, etc.)

Get your connection string from your cloud provider and use it in the `.env` file.

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================

# Local PostgreSQL (Homebrew)
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/optimumcv"
# Replace YOUR_USERNAME with your macOS username (e.g., mohamedashrefbenabdallah)

# OR Cloud PostgreSQL (Neon, Supabase)
# DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# ==============================================================================
# AUTHENTICATION (Better-Auth)
# ==============================================================================

# Generate a secure secret (run the command below)
BETTER_AUTH_SECRET="your-generated-secret-here"

# Your app URL
BETTER_AUTH_URL="http://localhost:3000"

# ==============================================================================
# OAUTH PROVIDERS
# ==============================================================================

# Google OAuth (Create at: https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (Create at: https://github.com/settings/developers)
# GITHUB_CLIENT_ID="your-github-client-id"
# GITHUB_CLIENT_SECRET="your-github-client-secret"

# ==============================================================================
# AI CONFIGURATION (OpenRouter)
# ==============================================================================

# Get API key at: https://openrouter.ai/keys
OPENROUTER_API_KEY="sk-or-v1-..."

# ==============================================================================
# PUBLIC APP CONFIGURATION
# ==============================================================================

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Generate `BETTER_AUTH_SECRET`

Run this command to generate a secure 32-character secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `BETTER_AUTH_SECRET` in your `.env` file.

### 4. Push Database Schema

Run Drizzle to create all necessary tables in your PostgreSQL database:

```bash
bun run db:push
```

This will create the following tables:
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth account connections
- `verification` - Email/OAuth verification tokens
- `profile` - User CV/Resume profiles
- `pfe_book` - Uploaded PFE books
- `pfe_topic` - Extracted topics from PFE books
- `application` - Application submissions

### 5. Run the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `bun run dev` - Start the development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run Biome linter
- `bun run format` - Format code with Biome
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio (database GUI)

## Project Structure

This project follows a **Feature-Driven Architecture**:

```
optimum-v2/
├── app/                    # Next.js App Router (routing only)
├── features/               # Feature modules (domain logic)
│   ├── auth/              # Authentication feature
│   ├── resume/            # Resume/CV management
│   └── pfe/               # PFE topic management
├── components/ui/          # Generic UI primitives (shadcn/ui)
├── lib/                    # Shared utilities, DB, auth config
│   ├── schema.ts          # Drizzle database schema
│   ├── db.ts              # Database connection
│   └── auth.ts            # Better-Auth configuration
└── public/                 # Static assets
```

### Architecture Rules

- **Features are isolated**: Business logic belongs in `features/`
- **UI primitives only**: Generic components go in `components/ui`
- **Server Actions**: Use for all mutations
- **No `any` types**: Use `unknown` if absolutely necessary

## Setting Up OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env`

### GitHub OAuth (Optional)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

## Troubleshooting

### Database Connection Issues

If you see `relation "verification" does not exist`:
```bash
# Make sure you've run migrations
bun run db:push
```

### Invalid BETTER_AUTH_SECRET

If you see `Invalid BETTER_AUTH_SECRET: must be at least 32 characters`:
```bash
# Generate a new secret
openssl rand -base64 32

# Update your .env file with the generated secret
```

### OAuth Login Errors

1. Verify your OAuth credentials are correct in `.env`
2. Check that callback URLs match in your OAuth provider settings
3. Ensure `BETTER_AUTH_URL` matches your actual app URL

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## License

[Your License Here]
