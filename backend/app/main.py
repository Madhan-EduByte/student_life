"""
DestinAI — FastAPI Application Entry Point
Main application with CORS, routers, health check, and lifespan events.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.APP_DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info(f"🚀 Starting {settings.APP_NAME} v1.0.0")
    logger.info(f"   Environment: {settings.APP_ENV}")
    logger.info(f"   Debug: {settings.APP_DEBUG}")
    
    primary = settings.AI_PRIMARY_MODEL.lower()
    logger.info(f"   AI Primary Model: {primary}")
    
    SUPPORTED_PROVIDERS = {"gemini", "openai", "meta", "perplexity", "grok", "deepseek"}
    if primary not in SUPPORTED_PROVIDERS:
        logger.warning(
            f"⚠️ Unsupported AI primary provider '{primary}' configured in LLL_PROVIDER. "
            f"Supported providers are: {sorted(list(SUPPORTED_PROVIDERS))}. "
            f"The app will fall back to mock data unless a valid provider is configured."
        )
    yield
    logger.info(f"🛑 Shutting down {settings.APP_NAME}")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Career Guidance System — Your destiny, powered by AI.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS Middleware ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Include API Routers ────────────────────────────────
app.include_router(api_router)


# ─── Health Check ────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for Docker and monitoring."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "environment": settings.APP_ENV,
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "app": settings.APP_NAME,
        "message": "Your destiny, powered by AI.",
        "docs": "/docs",
        "version": "1.0.0",
    }
