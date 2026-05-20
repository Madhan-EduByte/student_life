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
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [AI Engine Setup](#ai-engine-setup)
- [How to Run Everything](#how-to-run-everything)
- [Demo Credentials](#demo-credentials)
- [Code Quality Standards](#code-quality-standards)
- [Security Standards](#security-standards)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Recent Changes](#recent-changes)
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
- Multi-language support (5 languages in Year 1)

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | 18.x | UI framework |
| Vite | 5.x | Build tool |
| TailwindCSS | 3.x | Styling |
| Axios | 1.x | HTTP client |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Backend language |
| FastAPI | 0.110+ | API framework |
| SQLAlchemy | 2.x | ORM |
| Alembic | 1.x | Migrations |
| Pydantic | 2.x | Validation |

### Database
| Technology | Version | Purpose |
|---|---|---|
| MySQL | 8.0+ | Main database |
| Redis | 7.x | Caching |

### AI Engine
| Technology | Purpose |
|---|---|
| Google Gemini API | Roadmap generation |
| OpenAI GPT-4 API | Fallback model |

---

## System Requirements

### Windows 11

#### Minimum
- RAM: 4 GB (6+ GB recommended)
- Storage: 10 GB free
- **No Docker, WSL2, or virtual environments**

        #### Install These 4 Apps

        1. **Python 3.11+**
        - Download: https://www.python.org/downloads/
        - ✅ Check "Add Python to PATH"
        - Restart computer

        2. **Node.js 20+ (LTS)**
        - Download: https://nodejs.org/
        - Restart computer

        3. **MySQL 8.0+**
        - Download: https://dev.mysql.com/downloads/mysql/
        - Password: `root`
        - ✅ Check "Install as Windows Service"
        - Restart computer

        4. **Redis 7+**
        - Download: https://github.com/microsoftarchive/redis/releases
        - Extract to: `C:\Redis\`

        #### Verify Installation

        ```powershell
        python --version
        node --version
        npm --version
        mysql --version
        redis-cli --version
        ```

        All should show version numbers.

        ---

        ## Quick Start

        ### Step 1: Install 4 Apps (45 minutes)

        Follow the installation steps above. **Remember to restart after each app.**

        ### Step 2: Run Setup (5 minutes)

        Open PowerShell in your project folder:

        ```powershell
        .\setup-no-docker.ps1
        ```

        Wait for completion message.

        ### Step 3: Start Services (3 PowerShell Windows)

        **Terminal 1 — Redis:**
        ```powershell
        C:\Redis\redis-server.exe
        ```
        Should show: `Ready to accept connections`

        **Terminal 2 — Backend:**
        ```powershell
        cd backend
        uvicorn app.main:app --reload
        ```
        Should show: `Uvicorn running on http://0.0.0.0:8000`

        **Terminal 3 — Frontend:**
        ```powershell
        cd frontend
        npm run dev
        ```
        Should show: `Local: http://localhost:5173`

        ### Step 4: Open Browser

        Go to: **http://localhost:5173**

---

## Project Structure

```
project/
├── frontend/               # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── backend/                # FastAPI app
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── requirements.txt
│   └── migrations/
│
├── database/               # SQL files
│   ├── init.sql
│   ├── seed_careers.sql
│   ├── seed_colleges.sql
│   ├── seed_users.sql
│
├── readme.md               # This file
└── setup-no-docker.ps1     # Setup script
```

---

## Environment Configuration

Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

Edit `.env` with your values:

```env
# Application
APP_NAME=DestinAI
APP_ENV=development
APP_PORT=8000
FRONTEND_PORT=5173

# Database (local)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=destinai_db
DB_USER=root
DB_PASSWORD=root123
DB_ROOT_PASSWORD=root123

# Cache (local)
REDIS_HOST=localhost
REDIS_PORT=6379

# AI APIs
GEMINI_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
AI_PRIMARY_MODEL=gemini

# JWT
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=DestinAI
```

### Get API Keys

**Google Gemini:**
1. Go to https://aistudio.google.com
2. Click "Get API Key"
3. Copy to `.env`

**OpenAI:**
1. Go to https://platform.openai.com
2. Create API key
3. Copy to `.env`

---

## Database Setup

MySQL is automatically setup by the script.

### Manual Commands

```powershell
# Create database
mysql -u root -proot123 -e "CREATE DATABASE destinai_db;"

# Run migrations
cd backend
alembic upgrade head

# Initialize tables + default data
python init_db.py
```

---

## Frontend Setup

### Install & Run

```powershell
cd frontend
npm install
npm run dev
```

### Key Commands

```powershell
npm run build      # Build for production
npm run lint       # Run ESLint
npm run test       # Run tests
```

---

## Backend Setup

### Install & Run

```powershell
cd backend
pip install -r requirements.txt
alembic upgrade head
python init_db.py
uvicorn app.main:app --reload
```

### Key Commands

```powershell
pytest                          # Run tests
pytest --cov=app               # Coverage report
black app/                      # Format code
flake8 app/                     # Lint code
alembic revision --autogenerate -m "description"  # Create migration
```

---

## AI Engine Setup

The AI engine works as follows:

```
Student answers 6 questions
        ↓
Input validation
        ↓
Profile constructed
        ↓
Prompt engineered
        ↓
Gemini API called (or OpenAI fallback)
        ↓
Response parsed
        ↓
Roadmap stored in database
        ↓
Milestones generated
        ↓
College matches ranked
        ↓
Future-proof score calculated
        ↓
Full roadmap returned
```

---

## How to Run Everything

### 3 PowerShell Windows

**Window 1 — Redis Server:**
```powershell
C:\Redis\redis-server.exe
```
Expected: `Ready to accept connections`

**Window 2 — Backend API:**
```powershell
cd backend
uvicorn app.main:app --reload
```
Expected: `Uvicorn running on http://0.0.0.0:8000`

**Window 3 — Frontend:**
```powershell
cd frontend
npm run dev
```
Expected: `Local: http://localhost:5173`

### Services

| Service | Port | Status |
|---------|------|--------|
| Redis | 6379 | ✓ Running |
| MySQL | 3306 | ✓ Running (Service) |
| Backend | 8000 | ✓ Running |
| Frontend | 5173 | ✓ Running |

### Open Browser

```
http://localhost:5173
```

### Stop Everything

Close all 3 PowerShell windows.

---

## Demo Credentials

### Test Accounts (Use these to log in)

| Role | Email | Password |
|---|---|---|
| Student | `student@example.com` | `password123` |
| Admin | `admin@example.com` | `password123` |
| Phone Login | `9876543210` | `password123` |

**Note:** These are non-persistent demo accounts. Any data entered will be stored in the database but not returned after logout.

---

## Code Quality Standards

### Frontend
- Functional components with hooks
- Tailwind CSS only (no inline styles)
- Tests for every component
- ESLint + Prettier

### Backend
- Pydantic validation on all endpoints
- SQLAlchemy ORM (no raw SQL)
- Type hints everywhere
- Docstrings on all functions
- Black formatter + isort

### Git Commits

```
feat: new feature
fix: bug fix
docs: documentation
refactor: code refactor
test: add tests
```

---

## Security Standards

### Authentication
- JWT tokens (30 min access, 7 days refresh)
- Bcrypt password hashing (rounds = 12)
- Role-based access control
- Rate limiting (5 req/min)
- Account lockout after 5 failed attempts

### Data Protection
- All passwords hashed
- API keys in .env only
- HTTPS in production
- CORS configured
- SQL injection prevention (ORM)
- XSS prevention (React)

### Dependency Security

```powershell
# Frontend
npm audit
npm audit fix

# Backend
pip install safety
safety check -r requirements.txt
```

---

## Testing

### Frontend

```powershell
cd frontend
npm run test
npm run test:coverage
```

### Backend

```powershell
cd backend
pytest
pytest --cov=app --cov-report=html
```

### Coverage Targets

| Module | Target |
|--------|--------|
| AI service | 90%+ |
| Auth endpoints | 95%+ |
| College matching | 85%+ |
| Frontend components | 75%+ |

---

## API Documentation

Once backend is running:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Core Endpoints

```
POST   /api/v1/auth/register          Register
POST   /api/v1/auth/login             Login
POST   /api/v1/roadmap/generate       Generate roadmap
GET    /api/v1/roadmap/{id}           Get roadmap
GET    /api/v1/colleges/match         Match colleges
GET    /api/v1/students/profile       Get profile
```

---

## Recent Changes

### Session: Database & UI Integration (April 11, 2026)

#### 🎯 What Was Done

**1. Database Setup & Testing**
- ✅ Initialized MySQL database with 15 tables
- ✅ Seeded 10 colleges, 15 careers, 30 college courses, 4 streams
- ✅ Created database testing commands and validation scripts
- ✅ Verified all tables created successfully

**2. Frontend-Backend Integration**
- ✅ Updated CollegeMatch page to fetch real college data from backend API
- ✅ Added loading & error states for better UX
- ✅ Integrated colleges list with search and filter functionality
- ✅ Created `.env` file with correct backend URL: `http://localhost:8000/api/v1`

**3. Security Improvements**
- ✅ Removed password exposure from auth service console logs
- ✅ Removed sensitive credentials from error responses
- ✅ Hidden demo passwords from UI (now shows email only)
- ✅ Updated login page to reference README for credentials instead of showing them

**4. Documentation**
- ✅ Added `Demo Credentials` section to README
- ✅ Added `Recent Changes` section to track development progress
- ✅ Documented all endpoints and their purposes

#### 📋 Files Modified

| File | Change |
|---|---|
| `frontend/src/pages/CollegeMatch.jsx` | Connected to backend API, added loading/error states |
| `frontend/src/services/authService.js` | Removed password from console logs |
| `frontend/src/hooks/useAuth.js` | Removed sensitive data logging |
| `frontend/src/pages/Login.jsx` | Hid passwords from UI, added documentation notice |
| `.env` | Created with correct API base URL (http://localhost:8000/api/v1) |
| `readme.md` | Added Demo Credentials & Recent Changes sections |

#### 🚀 Database Content

**Colleges**: 20 institutions (IIT Bombay, IIT Delhi, IISc, BITS Pilani, VIT, NIT, etc.)
**Careers**: 20 professions (Software Engineer, Data Scientist, Doctor, CA, UX Designer, etc.)
**Career Scores**: Automation risk, AI replacement risk, future-proof scores
**College Courses**: B.Tech, BCA, B.Com across different colleges
**Streams**: Science, Commerce, Arts, Vocational

#### 🔧 Setup Requirements (Mac/Linux)

The current setup uses `.env` file which is automatically loaded by Vite/FastAPI. No changes needed to `setup-no-docker.ps1` for Mac since it's Windows-specific.

**For Mac setup:**
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python init_db.py
python -m uvicorn app.main:app --reload

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Port Already in Use

```powershell
# Kill port 8000
Get-NetTCPConnection -LocalPort 8000 | Stop-Process

# Kill port 5173
Get-NetTCPConnection -LocalPort 5173 | Stop-Process
```

### MySQL Won't Start

```powershell
net start MySQL80
```

### Redis Won't Start

Verify exists:
```powershell
C:\Redis\redis-server.exe
```

### Database Connection Error

```powershell
# Test connection
mysql -u root -proot123 -e "SELECT 1;"
```

### Python Not Found

- Restart computer after installation
- Check "Add Python to PATH" was checked
- Verify: `python --version`

### npm Packages Won't Install

```powershell
cd frontend
rm -r node_modules
npm install
```

### Backend Dependencies Error

```powershell
cd backend
pip install --upgrade -r requirements.txt
```

### AI API Not Working

Verify `.env` has correct API keys:
```powershell
type .env | findstr GEMINI
type .env | findstr OPENAI
```

Test connection:
```powershell
cd backend
python -m app.utils.test_ai_connection
```

### Database Migration Error

Reset migrations:
```powershell
cd backend
alembic downgrade base
alembic upgrade head
python init_db.py
```

### Complete Reset

```powershell
# Close all terminals

# Delete database
mysql -u root -proot123 -e "DROP DATABASE destinai_db;"

# Restart setup
.\setup-no-docker.ps1
```

---

## Contributing Guidelines

1. Create feature branch: `git checkout -b feat/your-feature`
2. Write code & tests
3. Run: `pytest` and `npm test`
4. Format: `black app/` and `npm run format`
5. Commit: `git commit -m "feat: your message"`
6. Push: `git push origin feat/your-feature`
7. Create Pull Request to `develop`

---

## License

DestinAI — BCA Final Year Project
APS College of Arts and Science
2025–26

---

**Built with purpose. Guided by AI. For every student on earth.**
