# Vercel serverless function entry point
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.server import app

# Export the FastAPI app for Vercel
handler = app
