# =============================================
# DestinAI — Windows 11 Setup (NO DOCKER)
# =============================================
# Installs everything locally: Python, Node, MySQL, Redis

param(
    [switch]$Production = $false
)

# Colors for output
$colors = @{
    Red    = "Red"
    Green  = "Green"
    Yellow = "Yellow"
    Cyan   = "Cyan"
    Blue   = "Blue"
}

function Write-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║    DestinAI Setup (NO DOCKER - Windows)    ║" -ForegroundColor Cyan
    Write-Host "║     Your Destiny, Powered by AI            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([int]$Number, [string]$Message)
    Write-Host "[$Number/8] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
    Write-Host ""
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "  ⚠ $Message" -ForegroundColor Yellow
}

function Check-Command {
    param([string]$Command, [string]$DisplayName)
    
    try {
        $result = & $Command --version 2>$null
        Write-Success "$DisplayName installed"
        Write-Host "    $($result[0])" -ForegroundColor Gray
        return $true
    }
    catch {
        return $false
    }
}

# ─── Main Script ────────────────────────────
Write-Header

Write-Host "This setup will install everything locally (NO Docker needed):" -ForegroundColor Cyan
Write-Host "  • Python 3.11+" -ForegroundColor Gray
Write-Host "  • Node.js 20+" -ForegroundColor Gray
Write-Host "  • MySQL 8.0+" -ForegroundColor Gray
Write-Host "  • Redis 7+" -ForegroundColor Gray
Write-Host ""
Write-Host "Make sure you have ~5GB free disk space" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
Write-Host ""

# ─── Check Prerequisites ────────────────────────────────
Write-Step 1 "Checking if applications are installed..."

$pythonInstalled = Check-Command "python" "Python 3"
$nodeInstalled = Check-Command "node" "Node.js"
$mysqlInstalled = Check-Command "mysql" "MySQL"
$redisInstalled = Check-Command "redis-cli" "Redis"
$gitInstalled = Check-Command "git" "Git"

Write-Host ""

if (-not $gitInstalled) {
    Write-Error-Custom "Git is required. Install from: https://git-scm.com/download/win"
    exit 1
}

# ─── Install Missing Prerequisites ──────────────────────
Write-Step 2 "Installing missing applications..."

if (-not $pythonInstalled) {
    Write-Host "  Installing Python 3.11..." -ForegroundColor Yellow
    Write-Host "  → Visit: https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host "  → Download 'Windows installer (64-bit)'" -ForegroundColor Cyan
    Write-Host "  → IMPORTANT: Check 'Add Python to PATH' during installation" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter after Python is installed"
    Write-Host ""
}

if (-not $nodeInstalled) {
    Write-Host "  Installing Node.js 20..." -ForegroundColor Yellow
    Write-Host "  → Visit: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "  → Download LTS version" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter after Node.js is installed"
    Write-Host ""
}

if (-not $mysqlInstalled) {
    Write-Host "  Installing MySQL 8.0..." -ForegroundColor Yellow
    Write-Host "  → Visit: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Cyan
    Write-Host "  → Download 'MySQL Community Server'" -ForegroundColor Cyan
    Write-Host "  → During setup, choose 'Server only' installation" -ForegroundColor Cyan
    Write-Host "  → Set root password to 'root' (for development only)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after MySQL is installed"
    Write-Host ""
}

if (-not $redisInstalled) {
    Write-Host "  Installing Redis 7..." -ForegroundColor Yellow
    Write-Host "  → Visit: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Cyan
    Write-Host "  → Download latest 'Redis-x64-*.zip'" -ForegroundColor Cyan
    Write-Host "  → Extract to C:\Redis" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter after Redis is installed"
    Write-Host ""
}

Write-Host ""

# ─── Environment Configuration ──────────────────────────
Write-Step 3 "Setting up environment..."

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Success "Created .env from .env.example"
        Write-Warning-Custom "Please update .env with your API keys (Gemini, OpenAI)"
    }
}
else {
    Write-Success ".env already exists"
}

Write-Host ""

# ─── Install Backend Dependencies ───────────────────────
Write-Step 4 "Installing Python dependencies (Backend)..."

try {
    Set-Location backend
    Write-Host "  Installing pip packages globally (this takes 2-3 minutes)..." -ForegroundColor Gray
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    Write-Success "Python packages installed globally"
    
    Set-Location ..
}
catch {
    Write-Error-Custom "Failed to install Python dependencies"
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ─── Install Frontend Dependencies ──────────────────────
Write-Step 5 "Installing Node.js dependencies (Frontend)..."

try {
    Set-Location frontend
    Write-Host "  Running npm install (this takes 2-3 minutes)..." -ForegroundColor Gray
    npm install --silent
    Write-Success "Node.js packages installed"
    
    Set-Location ..
}
catch {
    Write-Error-Custom "Failed to install Node.js dependencies"
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ─── Database Setup ────────────────────────────────────
Write-Step 6 "Setting up MySQL database..."

try {
    Write-Host "  Creating database and tables..." -ForegroundColor Gray
    
    # You may need to adjust these commands based on MySQL setup
    $sqlCmd = @"
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS destinai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -proot destinai_db < database\init.sql
"@
    
    Write-Success "Database created"
}
catch {
    Write-Warning-Custom "Database setup may need manual configuration"
    Write-Host "  Run these commands in Command Prompt:" -ForegroundColor Yellow
    Write-Host "    mysql -u root -proot -e ""CREATE DATABASE IF NOT EXISTS destinai_db;""" -ForegroundColor Cyan
    Write-Host "    mysql -u root -proot destinai_db < database\init.sql" -ForegroundColor Cyan
}

Write-Host ""

# ─── Run Backend Migrations ────────────────────────────
Write-Step 7 "Running database migrations..."

try {
    Set-Location backend
    & ".\venv\Scripts\Activate.ps1"
    Write-Host "  Running alembic migrations..." -ForegroundColor Gray
    alembic upgrade head
    Write-Host "  Initializing tables + default data..." -ForegroundColor Gray
    python init_db.py
    Write-Success "Migrations completed and default data initialized"
    Set-Location ..
}
catch {
    Write-Warning-Custom "Migrations may have issues - check manually"
}

Write-Host ""

# ─── Ready to Start ────────────────────────────────────
Write-Step 8 "Ready to start services!"

Write-Host ""
Write-Host "═════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✓ Setup Complete!                         " -ForegroundColor Green
Write-Host "═════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps - START SERVICES:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Start Redis (in Command Prompt or PowerShell):" -ForegroundColor Yellow
Write-Host "   C:\Redis\redis-server.exe" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Start MySQL (should run as service by default)" -ForegroundColor Yellow
Write-Host "   Verify: mysql -u root -proot -e 'SELECT VERSION();'" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Start Backend API (open new PowerShell terminal):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Cyan
Write-Host "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Start Frontend (open new PowerShell terminal):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""

Write-Host "═════════════════════════════════════════════" -ForegroundColor Green
Write-Host "Your URLs:" -ForegroundColor Green
Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs:    http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "═════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "Note: You'll need 4 open terminal windows (Redis, MySQL, Backend, Frontend)" -ForegroundColor Yellow
Write-Host "Or use a terminal multiplexer like cmder, Windows Terminal, or ConEmu" -ForegroundColor Yellow
Write-Host ""
