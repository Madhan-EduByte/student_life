"""
DestinAI — Database Seeder
Loads default data from SQL seed files in the database directory.
"""

import logging
from pathlib import Path
from typing import Iterable

from app.core.database import engine

logger = logging.getLogger(__name__)

DATABASE_DIR = Path(__file__).resolve().parents[3] / "database"
SEED_FILES = (
    "seed_careers.sql",
    "seed_colleges.sql",
    "seed_users.sql",
    "seed_student_profiles.sql",
)


def _iter_sql_statements(sql_script: str) -> Iterable[str]:
    """Split SQL script into executable statements."""
    cleaned_lines = []

    for line in sql_script.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("--"):
            continue
        cleaned_lines.append(line)

    cleaned_sql = "\n".join(cleaned_lines)
    for statement in cleaned_sql.split(";"):
        statement = statement.strip()
        if statement:
            yield statement


def _execute_sql_file(file_path: Path) -> None:
    """Execute all SQL statements from a single file."""
    if not file_path.exists():
        raise FileNotFoundError(f"Seed file not found: {file_path}")

    sql_script = file_path.read_text(encoding="utf-8")
    with engine.begin() as conn:
        for statement in _iter_sql_statements(sql_script):
            conn.exec_driver_sql(statement)


def run_seed() -> None:
    """Run SQL seed files in the configured order."""
    logger.info("🌱 Starting database seed from SQL files")

    for seed_file in SEED_FILES:
        file_path = DATABASE_DIR / seed_file
        logger.info("📄 Running %s", seed_file)
        _execute_sql_file(file_path)

    logger.info("🌱 Database seeding complete!")


if __name__ == "__main__":
    run_seed()
