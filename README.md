# DestinAI — AI-Powered Career Guidance System

> **"Your destiny, powered by AI."**
> An intelligent career guidance platform that takes 6 smart inputs from any student
> and delivers a precise, living career roadmap — matched colleges, courses, career paths,
> and weekly milestones — updated for life.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Quick Start — One Command Setup](#quick-start--one-command-setup)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [AI Engine Setup](#ai-engine-setup)
- [DevOps & Deployment](#devops--deployment)
- [Code Quality Standards](#code-quality-standards)
- [Security Standards](#security-standards)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing Guidelines](#contributing-guidelines)
- [License](#license)

---

## Project Overview

| Field | Details |
|---|---|
| Project Name | DestinAI |
| Domain | Web Development |
| College | APS College of Arts and Science |
| Course | BCA Final Year Project |
| Version | 1.0.0 |
| Status | Production Ready |

### Core Features
- 6-question AI career guidance engine
- Dynamic living career roadmap (auto-updated every 6 months)
- College DNA matching (15,000+ global colleges)
- Future-proof career score (AI automation risk + 20-year salary projection)
- AI career simulation — shadow any profession before choosing
- Micro-milestone engine — weekly actionable tasks
- Family compass mode — separate parent dashboard
- Multi-language support (5 languages in Year 1)

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | 18.x | UI framework |
| Vite | 5.x | Build tool (fast HMR) |
| TailwindCSS | 3.x | Styling |
| Axios | 1.x | HTTP client |
| React Router | 6.x | Client-side routing |
| React Query | 5.x | Server state management |
| Zustand | 4.x | Global state management |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Primary backend language |
| FastAPI | 0.110+ | REST API framework |
| Uvicorn | 0.29+ | ASGI server |
| SQLAlchemy | 2.x | ORM |
| Alembic | 1.x | Database migrations |
| Pydantic | 2.x | Data validation |
| JWT (python-jose) | 3.x | Authentication tokens |
| Bcrypt | 4.x | Password hashing |

### Database
| Technology | Version | Purpose |
|---|---|---|
| MySQL | 8.0+ | Primary relational database |
| Redis | 7.x | Caching and session storage |

### AI Engine
| Technology | Purpose |
|---|---|
| Google Gemini API | Primary AI model for career roadmap generation |
| OpenAI GPT-4 API | Fallback AI model |

### DevOps
| Technology | Purpose |
|---|---|
| Docker | Containerisation |
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy and static file serving |
| GitHub Actions | CI/CD pipeline |
| Let's Encrypt (Certbot) | Free SSL/TLS certificates |

---

## System Requirements

### Minimum (Development)
- OS: Ubuntu 20.04+ / macOS 12+ / Windows 11 with WSL2
- RAM: 4 GB
- Storage: 10 GB free
- CPU: 2 cores

### Recommended (Production)
- OS: Ubuntu 22.04 LTS
- RAM: 8 GB
- Storage: 50 GB SSD
- CPU: 4 cores

### Software Prerequisites

Before running any command, ensure the following are installed:

```bash
# Check versions
docker --version          # Docker 24.x+
docker compose version    # Docker Compose v2.x+
git --version             # Git 2.x+
node --version            # Node.js 20.x+ (for local dev only)
python3 --version         # Python 3.11+ (for local dev only)
```

#### Install Docker (Ubuntu)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

#### Install Node.js 20.x (Ubuntu)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install Python 3.11 (Ubuntu)
```bash
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip
```

---

## Quick Start — One Command Setup

> **This is all you need.** Clone and run — the entire platform starts automatically.

### Step 1 — Clone the repository
```bash
git clone https://github.com/your-username/destinai.git
cd destinai
```

### Step 2 — Configure environment
```bash
cp .env.example .env
# Open .env and add your API keys (see Environment Configuration section)
nano .env
```

### Step 3 — Launch everything
```bash
chmod +x setup.sh
./setup.sh
```

That's it. The `setup.sh` script automatically handles:
- Pulling all Docker images
- Building frontend and backend containers
- Running database migrations
- Seeding initial college and career data
- Starting all services (frontend, backend, database, Redis, Nginx)
- Running health checks on all services
- Printing the live URLs when ready

### Expected Output After Setup
```
=========================================
  DestinAI is running successfully!
=========================================
  Frontend:   http://localhost:3000
  Backend API: http://localhost:8000
  API Docs:   http://localhost:8000/docs
  Admin Panel: http://localhost:3000/admin
=========================================
```

---

## Project Structure

```
destinai/
├── frontend/                    # React.js application
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Images, icons, fonts
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Buttons, inputs, modals
│   │   │   ├── career/          # Career roadmap components
│   │   │   ├── college/         # College match components
│   │   │   └── dashboard/       # Dashboard widgets
│   │   ├── pages/               # Route-level page components
│   │   │   ├── Home.jsx
│   │   │   ├── Onboarding.jsx   # 6-question AI flow
│   │   │   ├── Roadmap.jsx      # Living career roadmap
│   │   │   ├── CollegeMatch.jsx
│   │   │   ├── Simulation.jsx   # Career simulation
│   │   │   ├── Dashboard.jsx
│   │   │   └── ParentDashboard.jsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand global state
│   │   ├── services/            # API call functions (Axios)
│   │   ├── utils/               # Helper functions
│   │   ├── constants/           # App-wide constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── routes/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── students.py
│   │   │   │   │   ├── careers.py
│   │   │   │   │   ├── colleges.py
│   │   │   │   │   ├── roadmap.py
│   │   │   │   │   ├── simulation.py
│   │   │   │   │   └── parents.py
│   │   │   │   └── __init__.py
│   │   │   └── deps.py          # Dependency injection
│   │   ├── core/
│   │   │   ├── config.py        # Settings from .env
│   │   │   ├── security.py      # JWT, hashing
│   │   │   └── database.py      # DB connection
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── student.py
│   │   │   ├── career.py
│   │   │   ├── college.py
│   │   │   └── roadmap.py
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # Business logic layer
│   │   │   ├── ai_service.py    # Gemini / GPT integration
│   │   │   ├── roadmap_service.py
│   │   │   ├── college_service.py
│   │   │   └── email_service.py
│   │   ├── utils/               # Utility functions
│   │   └── main.py              # FastAPI app entry point
│   ├── migrations/              # Alembic database migrations
│   ├── tests/                   # All backend tests
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/
│   ├── init.sql                 # Initial schema creation
│   ├── seed_careers.sql         # Career data seed
│   └── seed_colleges.sql        # College data seed (15,000+ colleges)
│
├── nginx/
│   ├── nginx.conf               # Reverse proxy config
│   └── ssl/                     # SSL certificates (auto-generated)
│
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI pipeline (test on every push)
│       └── deploy.yml           # CD pipeline (deploy on merge to main)
│
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
├── .env.example                 # Environment variable template
├── setup.sh                     # One-command setup script
├── Makefile                     # Developer shortcut commands
└── README.md
```

---

## Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### `.env.example`

```env
# =============================================
# APPLICATION
# =============================================
APP_NAME=DestinAI
APP_ENV=development              # development | production
APP_DEBUG=true
APP_PORT=8000
FRONTEND_PORT=3000
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars

# =============================================
# DATABASE — MySQL
# =============================================
DB_HOST=mysql
DB_PORT=3306
DB_NAME=destinai_db
DB_USER=destinai_user
DB_PASSWORD=your-strong-db-password-here
DB_ROOT_PASSWORD=your-root-password-here

# =============================================
# CACHE — Redis
# =============================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password-here

# =============================================
# AI ENGINE
# =============================================
GEMINI_API_KEY=your-google-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
AI_PRIMARY_MODEL=gemini                # gemini | openai
AI_FALLBACK_MODEL=openai

# =============================================
# JWT AUTHENTICATION
# =============================================
JWT_SECRET_KEY=your-jwt-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# =============================================
# EMAIL (for notifications & OTP)
# =============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@destinai.com

# =============================================
# CORS
# =============================================
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# =============================================
# FRONTEND
# =============================================
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=DestinAI
```

---

## Database Setup

### Schema Overview

The database is automatically created when you run `./setup.sh`. Manual setup:

```bash
# Run migrations only
docker compose exec backend alembic upgrade head

# Seed initial data (careers, colleges, streams)
docker compose exec backend python -m app.utils.seed
```

### Core Tables

```sql
-- Users and authentication
users              -- All user accounts (students, parents, counsellors)
student_profiles   -- Extended student information
parent_profiles    -- Parent accounts linked to students

-- Career intelligence
careers            -- 2,000+ career options with metadata
career_scores      -- Automation risk + salary + growth data
streams            -- Science / Commerce / Arts / Vocational

-- College matching
colleges           -- 15,000+ global colleges
college_courses    -- Courses offered per college
college_scores     -- Rankings, culture, alumni strength scores

-- Roadmaps
roadmaps           -- Generated AI roadmaps per student
milestones         -- Weekly milestone tasks per roadmap
roadmap_history    -- Version history (living roadmap updates)

-- Analytics
student_outcomes   -- Tracks whether students succeeded (moat data)
session_logs       -- User activity for AI improvement
```

---

## Frontend Setup

### Local Development (without Docker)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Scripts

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Build optimised production bundle
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Run Prettier formatter
npm run test         # Run unit tests (Vitest)
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run end-to-end tests (Playwright)
```

---

## Backend Setup

### Local Development (without Docker)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial data
python -m app.utils.seed

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Key Commands

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Generate new migration
alembic revision --autogenerate -m "your migration description"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# Format code
black app/
isort app/

# Lint code
flake8 app/
mypy app/
```

---

## AI Engine Setup

### How the AI Engine Works

```
Student answers 6 questions
        ↓
Input validation & sanitisation (Pydantic)
        ↓
Student profile constructed
        ↓
Prompt engineered with career + college + market data context
        ↓
Gemini API called (fallback: OpenAI GPT-4)
        ↓
Response parsed and structured (JSON)
        ↓
Roadmap stored in database
        ↓
Milestones generated (weekly tasks)
        ↓
College matches ranked
        ↓
Future-proof score calculated
        ↓
Full roadmap returned to frontend
```

### Getting API Keys

**Google Gemini API:**
1. Go to [https://aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new key
4. Copy into `.env` as `GEMINI_API_KEY`

**OpenAI API (fallback):**
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Go to API Keys section
3. Create new secret key
4. Copy into `.env` as `OPENAI_API_KEY`

---

## DevOps & Deployment

### Docker Compose — Development

```bash
# Start all services
docker compose up -d

# View all running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql

# Stop all services
docker compose down

# Stop and remove all data (full reset)
docker compose down -v
```

### Docker Compose — Production

```bash
# Deploy to production
docker compose -f docker-compose.prod.yml up -d --build

# Rolling update (zero downtime)
docker compose -f docker-compose.prod.yml up -d --build --no-deps backend
docker compose -f docker-compose.prod.yml up -d --build --no-deps frontend
```

### Makefile Shortcuts

```bash
make setup          # Full first-time setup
make up             # Start all services
make down           # Stop all services
make restart        # Restart all services
make logs           # Tail all logs
make migrate        # Run database migrations
make seed           # Seed database with initial data
make test           # Run all tests (frontend + backend)
make lint           # Run all linters
make build          # Build production images
make deploy         # Deploy to production server
make backup-db      # Backup MySQL database
make restore-db     # Restore MySQL from backup
make shell-backend  # Open shell in backend container
make shell-db       # Open MySQL shell
make clean          # Remove all containers, images, volumes
```

### Production Deployment on a VPS (Ubuntu 22.04)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Clone the repository
git clone https://github.com/your-username/destinai.git
cd destinai

# 3. Configure environment for production
cp .env.example .env
nano .env
# Set APP_ENV=production, APP_DEBUG=false, strong passwords

# 4. Run production setup (one command)
chmod +x setup.sh
./setup.sh --production

# 5. Setup SSL (free HTTPS)
docker compose -f docker-compose.prod.yml exec nginx certbot \
  --nginx -d yourdomain.com -d www.yourdomain.com

# Done — your site is live at https://yourdomain.com
```

### CI/CD Pipeline (GitHub Actions)

Every push to `main` branch automatically:
1. Runs all tests (frontend + backend)
2. Runs linting and code quality checks
3. Runs security vulnerability scan
4. Builds Docker images
5. Deploys to production server if all checks pass
6. Sends deployment notification

---

## Code Quality Standards

### Frontend Standards
- All components written as functional components with hooks
- No inline styles — Tailwind classes only
- Every component has a corresponding test file
- PropTypes or TypeScript types defined for all props
- No `console.log` in production code
- ESLint + Prettier enforced on every commit (Husky pre-commit hook)
- Maximum file length: 300 lines — split if longer

### Backend Standards
- All endpoints have input validation via Pydantic schemas
- All database queries go through SQLAlchemy ORM — no raw SQL
- All sensitive operations are logged
- Every function has a docstring
- Type hints on all function arguments and return values
- Black formatter + isort enforced on every commit
- Maximum function length: 50 lines — split if longer
- No hardcoded secrets — all from environment variables

### Git Commit Standards

```
feat: add college DNA matching algorithm
fix: resolve JWT token expiry issue
docs: update API documentation
style: format backend code with black
refactor: simplify AI prompt construction
test: add unit tests for roadmap service
chore: update dependencies
```

### Branch Strategy
```
main          → production (protected — PR required)
develop       → staging (integration branch)
feat/xyz      → new features
fix/xyz       → bug fixes
hotfix/xyz    → critical production fixes
```

---

## Security Standards

### Authentication & Authorisation
- JWT tokens with short expiry (30 minutes access, 7 days refresh)
- Bcrypt password hashing with salt rounds = 12
- Role-based access control (student / parent / counsellor / admin)
- Rate limiting on all authentication endpoints (5 requests/minute)
- Account lockout after 5 failed login attempts

### Data Protection
- All passwords hashed — never stored in plain text
- All API keys stored in environment variables — never in code
- Student data encrypted at rest (MySQL encryption)
- HTTPS enforced in production — HTTP redirects to HTTPS
- CORS configured to allow only trusted origins
- SQL injection prevented via SQLAlchemy ORM
- XSS prevented via React's built-in escaping
- CSRF protection enabled on all POST endpoints

### Dependency Security
```bash
# Frontend — check for vulnerabilities
npm audit
npm audit fix

# Backend — check for vulnerabilities
pip install safety
safety check -r requirements.txt
```

---

## Testing

### Run All Tests

```bash
# One command — runs everything
make test
```

### Frontend Tests

```bash
cd frontend

# Unit and component tests
npm run test

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Backend Tests

```bash
cd backend
source venv/bin/activate

# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html
open htmlcov/index.html

# Specific test file
pytest tests/test_ai_service.py

# Specific test function
pytest tests/test_roadmap.py::test_generate_roadmap_success
```

### Test Coverage Targets

| Module | Target Coverage |
|---|---|
| AI service (roadmap generation) | 90%+ |
| Authentication endpoints | 95%+ |
| College matching algorithm | 85%+ |
| Database models | 80%+ |
| Frontend components | 75%+ |

---

## API Documentation

Once the backend is running, interactive API documentation is auto-generated at:

- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Core Endpoints

```
POST   /api/v1/auth/register          Register new student account
POST   /api/v1/auth/login             Login and receive JWT tokens
POST   /api/v1/auth/refresh           Refresh access token
POST   /api/v1/auth/logout            Logout and invalidate token

POST   /api/v1/roadmap/generate       Generate AI roadmap from 6 inputs
GET    /api/v1/roadmap/{id}           Get student roadmap
PUT    /api/v1/roadmap/{id}/update    Trigger roadmap auto-update
GET    /api/v1/roadmap/{id}/milestones Get weekly milestones

GET    /api/v1/careers                List all career options
GET    /api/v1/careers/{id}           Get career details + future-proof score
GET    /api/v1/careers/simulate/{id}  Start AI career simulation

GET    /api/v1/colleges               List colleges (with filters)
GET    /api/v1/colleges/match         Get AI-matched colleges for student
GET    /api/v1/colleges/{id}          Get college details

GET    /api/v1/students/profile       Get student profile
PUT    /api/v1/students/profile       Update student profile

GET    /api/v1/parents/dashboard      Parent dashboard data
POST   /api/v1/parents/link           Link parent to student account
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9

# Find and kill process on port 8000
sudo lsof -ti:8000 | xargs kill -9

# Restart
docker compose up -d
```

### Database Connection Refused

```bash
# Check if MySQL container is running
docker compose ps mysql

# View MySQL logs
docker compose logs mysql

# Wait for MySQL to be ready (it takes ~30 seconds on first start)
docker compose up -d mysql
sleep 30
docker compose up -d backend
```

### AI API Not Responding

```bash
# Verify API keys are set correctly
docker compose exec backend python -c "from app.core.config import settings; print(settings.GEMINI_API_KEY[:10])"

# Test Gemini connection directly
docker compose exec backend python -m app.utils.test_ai_connection
```

### Frontend Not Loading

```bash
# Check frontend container logs
docker compose logs frontend

# Rebuild frontend container
docker compose up -d --build frontend
```

### Database Migration Errors

```bash
# Check current migration state
docker compose exec backend alembic current

# Reset to base and re-run all migrations
docker compose exec backend alembic downgrade base
docker compose exec backend alembic upgrade head
```

### Complete Reset (Nuclear Option)

```bash
# Stop everything and remove all data
docker compose down -v

# Remove all built images
docker rmi $(docker images -q destinai*)

# Start fresh
./setup.sh
```

---

## Contributing Guidelines

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature-name`
3. Write your code following the code quality standards above
4. Write tests for your changes
5. Run the full test suite: `make test`
6. Run linting: `make lint`
7. Commit your changes using the commit message standard
8. Push to your branch: `git push origin feat/your-feature-name`
9. Open a Pull Request to the `develop` branch
10. Wait for CI checks to pass and code review approval

---

## License

This project is submitted as a BCA Final Year Project at APS College of Arts and Science.

```
Project: DestinAI — AI-Powered Career Guidance System
Domain:  Web Development
Year:    2025–26
```

---

*Built with purpose. Guided by AI. Forged for every student on earth.*
