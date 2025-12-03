# Vercel serverless function entry point
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.server import app as fastapi_app
from mangum import Mangum

# Convert FastAPI to serverless handler using Mangum
handler = Mangum(fastapi_app)
