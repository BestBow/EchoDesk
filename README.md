<div align="center">
  <h1>EchoDesk</h1>
  <p>Multi-tenant feedback intelligence platform — collect, analyze, and act on feedback at scale.</p>

  ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)
  ![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql)
  ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
  ![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase)
  ![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

  <br />

  [Live Demo](https://echodesk.vercel.app) · [API Docs](https://echodesk-api.railway.app/api/docs) · [Report Bug](https://github.com/yourusername/echodesk/issues)
</div>

---

## What is EchoDesk?

EchoDesk helps companies collect structured feedback from employees or customers, analyze it in real time, and get AI-generated summaries — without anyone reading thousands of responses by hand.

Think of it as a lightweight Typeform + Hotjar + Notion, built specifically for internal feedback workflows.

---

## Features

**For form builders**
- Drag-and-drop form editor with 7 question types — short text, long text, single choice, multiple choice, rating, NPS, and date
- Conditional required fields and option branching
- Anonymous submission mode — respondent identities are never stored
- One-click publish, pause, and archive

**For analysts**
- Real-time response dashboard with charts and breakdowns
- NPS scoring calculated automatically
- AI-powered summaries of open-text responses (powered by Groq / Llama 3)
- Export-ready data with pagination

**For teams**
- Multi-tenant workspaces — each company gets complete data isolation
- Role-based access control — Owner, Admin, Manager, Viewer
- Member invite system by email
- Slack digest integration — weekly summaries sent to any channel

**For developers**
- RESTful API with full Swagger documentation
- JWT authentication with Firebase Auth (email/password + Google)
- Rate limiting, request validation, and global error handling
- Full CI/CD pipeline with GitHub Actions

---

## Architecture
echodesk/
├── apps/
│   ├── web/                  # Next.js 14 frontend → Vercel
│   │   └── src/
│   │       ├── app/          # App Router pages
│   │       ├── components/   # UI components
│   │       └── lib/          # Firebase, API client, Zustand stores
│   └── api/                  # NestJS backend → Railway
│       └── src/
│           ├── modules/      # Feature modules (auth, forms, analytics...)
│           ├── common/       # Guards, decorators, filters
│           └── prisma/       # Database service
└── packages/
└── types/                # Shared TypeScript types

### Request flow
Browser → Next.js (Vercel)
↓
Firebase Auth  →  ID Token
↓
NestJS API (Railway)  →  JWT
↓
PostgreSQL (Neon)  +  Redis (Upstash)
↓
Groq API (AI summaries)
↓
Cloudinary (file storage)
↓
Slack API (notifications)

---

## Tech Stack 

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN/UI |
| Backend | NestJS 10, TypeScript, Express |
| Database | PostgreSQL via Neon (serverless), Prisma ORM |
| Cache | Upstash Redis |
| Auth | Firebase Auth + JWT (RS256) |
| AI | Groq API — Llama 3 8B |
| File storage | Cloudinary |
| Notifications | Slack Block Kit API |
| State management | Zustand with persistence |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Drag and drop | dnd-kit |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend) + Railway (backend) |
| Monitoring | Sentry |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 8+
- A [Neon](https://neon.tech) account (free)
- A [Firebase](https://console.firebase.google.com) project
- A [Groq](https://console.groq.com) API key (free)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/echodesk.git
cd echodesk
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your credentials — see [Environment Variables](#environment-variables) below.

Copy the env to each app:

```bash
cp .env apps/web/.env
cp .env apps/api/.env
```

### 3. Set up the database

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

### 4. Run development servers

```bash
# Terminal 1 — frontend
cd apps/web && npm run dev

# Terminal 2 — backend
cd apps/api && npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Database (Neon)
DATABASE_URL="postgresql://..."

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Firebase Admin (backend)
FIREBASE_PROJECT_ID="..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@....iam.gserviceaccount.com"
JWT_SECRET="min-32-character-random-string"

# Firebase Client (frontend)
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="....firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."

# AI
GROQ_API_KEY="gsk_..."

# File storage
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Slack (optional)
SLACK_BOT_TOKEN="xoxb-..."
SLACK_SIGNING_SECRET="..."

# App
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

---

## API Reference

Full interactive documentation available at `/api/docs` when running locally.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/exchange` | Exchange Firebase ID token for JWT |

### Workspaces
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/workspaces` | List user's workspaces |
| POST | `/api/v1/workspaces` | Create workspace |
| GET | `/api/v1/workspaces/:id/members` | List members |
| POST | `/api/v1/workspaces/:id/members` | Invite member |
| PATCH | `/api/v1/workspaces/:id/members/:userId/role` | Update role |
| DELETE | `/api/v1/workspaces/:id/members/:userId` | Remove member |

### Forms
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/workspaces/:id/forms` | List forms |
| POST | `/api/v1/workspaces/:id/forms` | Create form |
| PATCH | `/api/v1/workspaces/:id/forms/:id/publish` | Publish form |
| PATCH | `/api/v1/workspaces/:id/forms/:id/pause` | Pause form |
| GET | `/api/v1/public/forms/:id` | Get active form (no auth) |

### Responses
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/responses` | Submit response (no auth) |
| GET | `/api/v1/responses/form/:id` | Get paginated responses |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/analytics/forms/:id` | Get form analytics |
| GET | `/api/v1/analytics/forms/:id/ai-summary` | Get AI summary |

---

## Deployment

### Frontend → Vercel

```bash
npm install -g vercel
cd apps/web
vercel --prod
```

Add all `NEXT_PUBLIC_*` environment variables in the Vercel dashboard.

### Backend → Railway

1. Push to GitHub
2. Create a new Railway project → "Deploy from GitHub repo"
3. Select the `apps/api` folder as the root
4. Add all environment variables in Railway dashboard
5. Railway auto-deploys on every push to `main`

### Database → Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Run `npx prisma migrate deploy` in production

---

## Project Structure

```apps/api/src/
├── modules/
│   ├── auth/           # Firebase token exchange, JWT strategy
│   ├── users/          # User profile management
│   ├── workspaces/     # Multi-tenant workspace + member management
│   ├── forms/          # Form CRUD, publish/pause/archive lifecycle
│   ├── responses/      # Response submission with validation
│   ├── analytics/      # Breakdown charts + Groq AI summaries
│   ├── uploads/        # Cloudinary avatar + logo uploads
│   └── notifications/  # Slack Block Kit digest sender
├── common/
│   ├── guards/         # JwtAuthGuard, RolesGuard
│   ├── decorators/     # @CurrentUser(), @Roles()
│   └── filters/        # Global HTTP exception filter
└── prisma/             # PrismaService (global singleton)
apps/web/src/
├── app/
│   ├── auth/           # Login + register pages
│   ├── dashboard/      # Overview, forms, team, settings
│   └── f/[formId]/     # Public form submission page
├── components/
│   ├── layout/         # Sidebar + Topbar
│   ├── forms/          # Form builder + renderer
│   └── shared/         # Empty states, spinners
└── lib/
├── firebase/        # Firebase client config
├── api/             # Axios client with interceptors
├── hooks/           # useAuth, useWorkspace
└── stores/          # Zustand workspace store
```

---

## Key Design Decisions

**Why NestJS over Express?** NestJS enforces a consistent module/service/controller pattern that scales cleanly as the codebase grows. Dependency injection, decorators, and the built-in Swagger plugin make it significantly more maintainable than plain Express for a project of this scope.

**Why Neon over a self-hosted Postgres?** Neon is serverless PostgreSQL with a generous free tier, automatic scaling, and zero ops. For a portfolio project it eliminates infrastructure management while demonstrating production-grade database usage with Prisma.

**Why Zustand over Redux?** Redux is significantly more boilerplate for the state complexity this app needs. Zustand's `persist` middleware handles localStorage sync in three lines, and its selective subscription model prevents unnecessary re-renders.

**Why Groq over OpenAI?** Groq's free tier is genuinely free with fast inference on Llama 3. For a feedback summarization use case the output quality is indistinguishable from GPT-3.5 and the API shape is nearly identical — easy to swap if needed.

---

## License

MIT © [Satvik Gahlot](https://github.com/BestBow)
