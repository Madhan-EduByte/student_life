# CareerCompass Name Change Log

## Changes Made

1. **Project Name**: CareerCompass → **CareerCompass**
2. **All docstrings**: "CareerCompass" → "CareerCompass" (56 files)
3. **Seed data**: Parent/counsellor removed (student/admin only)
4. **Models**: User role enum = student/admin
5. **API**: /admin routes added, /parents deleted
6. **Router**: Cleaned imports

## Demo Users (password123)
- student@example.com (student)
- admin@example.com (admin)

## Test
```bash
cd backend
python init_db.py  # reseed clean users
uvicorn app.main:app --reload
open http://localhost:8000/docs
```

**Ready!** 🎯
