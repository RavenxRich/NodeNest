from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
# from emergentintegrations.llm.chat import LlmChat, UserMessage  # Commented out for Vercel deployment
import json
import csv
from io import StringIO
import aiohttp

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# LLM Configuration
LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
DEFAULT_CATEGORIES = [
    {"id": "chat-assistants", "name": "Chat & Assistants", "color": "#EF4444"},
    {"id": "image-video", "name": "Image & Video", "color": "#EC4899"},
    {"id": "code-dev", "name": "Code & Dev Tools", "color": "#06B6D4"},
    {"id": "audio-voice", "name": "Audio & Voice", "color": "#F97316"},
    {"id": "writing-content", "name": "Writing & Content", "color": "#FBBF24"},
    {"id": "automation-agents", "name": "Automation & Agents", "color": "#10B981"},
    {"id": "data-research", "name": "Data & Research", "color": "#3B82F6"},
    {"id": "business-tools", "name": "Business Tools", "color": "#A855F7"}
]

# Models
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    color: str

class Tool(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    title: str
    url: str
    description: Optional[str] = None
    favicon: Optional[str] = None
    category_id: str
    tags: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    position: Dict[str, float] = Field(default_factory=dict)  # {angle, radius}
    click_count: int = 0
    date_added: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_used: Optional[datetime] = None
    favorite: bool = False

class ToolCreate(BaseModel):
    title: str
    url: str
    description: Optional[str] = None
    favicon: Optional[str] = None
    category_id: str
    tags: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    position: Dict[str, float] = Field(default_factory=dict)
    favorite: bool = False
    user_id: Optional[str] = None

class ToolUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    favicon: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    position: Optional[Dict[str, float]] = None
    favorite: Optional[bool] = None

class ExtractMetadataRequest(BaseModel):
    url: str
    llm_provider: str = "anthropic"  # anthropic, openai, gemini, local
    llm_model: str = "claude-4-sonnet-20250514"
    local_endpoint: Optional[str] = None  # For local LLMs
    local_api_key: Optional[str] = None  # Optional API key for local LLMs

class ExtractMetadataResponse(BaseModel):
    title: str
    description: str
    category_id: str
    tags: List[str]
    favicon: Optional[str] = None

class ImportToolsRequest(BaseModel):
    format: str  # csv or json
    data: str
    user_id: Optional[str] = None

# Helper functions
async def extract_metadata_with_llm(url: str, provider: str = "anthropic", model: str = "claude-4-sonnet-20250514", 
                                   local_endpoint: Optional[str] = None, local_api_key: Optional[str] = None) -> Dict[str, Any]:
    """Extract metadata from URL using LLM (cloud or local)"""
    try:
        categories_str = ", ".join([f"{c['id']} ({c['name']})" for c in DEFAULT_CATEGORIES])
        prompt = f"""Extract metadata for this URL: {url}

Available categories: {categories_str}

Provide:
1. A descriptive title (infer from URL if needed)
2. A brief description of what this tool likely does
3. The most appropriate category_id from the list above
4. 2-4 relevant tags
5. The likely favicon URL (usually https://www.google.com/s2/favicons?domain=DOMAIN&sz=64)

Respond with ONLY the JSON object, no other text."""

        if provider == "local" and local_endpoint:
            # Local LLM via OpenAI-compatible endpoint
            import aiohttp
            headers = {"Content-Type": "application/json"}
            if local_api_key:
                headers["Authorization"] = f"Bearer {local_api_key}"
            
            payload = {
                "model": model or "default",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a metadata extraction assistant. Given a URL, extract the likely title, description, category, and relevant tags. Respond ONLY with valid JSON."
                    },
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 500
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{local_endpoint}/v1/chat/completions", json=payload, headers=headers, timeout=30) as resp:
                    result = await resp.json()
                    response_text = result["choices"][0]["message"]["content"]
        else:
            # Cloud LLM - Using basic fallback for Vercel deployment
            # emergentintegrations not available on PyPI
            # For now, return a simple extraction from the URL
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.replace('www.', '')
            title = domain.split('.')[0].title()
            
            response_text = json.dumps({
                "title": title,
                "description": f"AI tool from {domain}",
                "category_id": "ai-assistants",
                "tags": ["ai", "tool"],
                "favicon": f"https://{domain}/favicon.ico"
            })
        
        # Parse JSON from response
        response_text = response_text.strip()
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        
        metadata = json.loads(response_text.strip())
        return metadata
    except Exception as e:
        logging.error(f"Error extracting metadata: {e}")
        # Fallback metadata
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        return {
            "title": domain,
            "description": f"AI tool from {domain}",
            "category_id": "chat-assistants",
            "tags": ["ai", "tool"],
            "favicon": f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
        }

# Routes
@api_router.get("/")
async def root():
    return {"message": "NodeNest API"}

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    return DEFAULT_CATEGORIES

# Tools
@api_router.post("/tools/extract-metadata", response_model=ExtractMetadataResponse)
async def extract_metadata(request: ExtractMetadataRequest):
    """Extract metadata from URL using AI"""
    metadata = await extract_metadata_with_llm(
        request.url, 
        request.llm_provider, 
        request.llm_model,
        request.local_endpoint,
        request.local_api_key
    )
    return ExtractMetadataResponse(**metadata)

@api_router.post("/tools", response_model=Tool)
async def create_tool(tool_input: ToolCreate):
    tool = Tool(**tool_input.model_dump())
    doc = tool.model_dump()
    doc['date_added'] = doc['date_added'].isoformat()
    if doc['last_used']:
        doc['last_used'] = doc['last_used'].isoformat()
    
    await db.tools.insert_one(doc)
    return tool

@api_router.get("/tools", response_model=List[Tool])
async def get_tools(user_id: Optional[str] = None):
    query = {}
    if user_id:
        query['user_id'] = user_id
    else:
        query['user_id'] = None
    
    tools = await db.tools.find(query, {"_id": 0}).to_list(1000)
    
    for tool in tools:
        if isinstance(tool.get('date_added'), str):
            tool['date_added'] = datetime.fromisoformat(tool['date_added'])
        if tool.get('last_used') and isinstance(tool['last_used'], str):
            tool['last_used'] = datetime.fromisoformat(tool['last_used'])
    
    return tools

@api_router.get("/tools/{tool_id}", response_model=Tool)
async def get_tool(tool_id: str):
    tool = await db.tools.find_one({"id": tool_id}, {"_id": 0})
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    if isinstance(tool.get('date_added'), str):
        tool['date_added'] = datetime.fromisoformat(tool['date_added'])
    if tool.get('last_used') and isinstance(tool['last_used'], str):
        tool['last_used'] = datetime.fromisoformat(tool['last_used'])
    
    return Tool(**tool)

@api_router.put("/tools/{tool_id}", response_model=Tool)
async def update_tool(tool_id: str, tool_update: ToolUpdate):
    existing_tool = await db.tools.find_one({"id": tool_id}, {"_id": 0})
    if not existing_tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    update_data = {k: v for k, v in tool_update.model_dump().items() if v is not None}
    if update_data:
        await db.tools.update_one({"id": tool_id}, {"$set": update_data})
    
    updated_tool = await db.tools.find_one({"id": tool_id}, {"_id": 0})
    if isinstance(updated_tool.get('date_added'), str):
        updated_tool['date_added'] = datetime.fromisoformat(updated_tool['date_added'])
    if updated_tool.get('last_used') and isinstance(updated_tool['last_used'], str):
        updated_tool['last_used'] = datetime.fromisoformat(updated_tool['last_used'])
    
    return Tool(**updated_tool)

@api_router.delete("/tools/{tool_id}")
async def delete_tool(tool_id: str):
    result = await db.tools.delete_one({"id": tool_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tool not found")
    return {"message": "Tool deleted successfully"}

@api_router.post("/tools/{tool_id}/track-click")
async def track_click(tool_id: str):
    """Increment click counter and update last used timestamp"""
    result = await db.tools.update_one(
        {"id": tool_id},
        {
            "$inc": {"click_count": 1},
            "$set": {"last_used": datetime.now(timezone.utc).isoformat()}
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tool not found")
    return {"message": "Click tracked"}

# Import/Export
@api_router.post("/tools/import")
async def import_tools(request: ImportToolsRequest):
    """Bulk import tools from CSV or JSON"""
    imported_count = 0
    
    try:
        if request.format == "json":
            tools_data = json.loads(request.data)
            for tool_data in tools_data:
                tool_data['user_id'] = request.user_id
                tool = Tool(**tool_data)
                doc = tool.model_dump()
                doc['date_added'] = doc['date_added'].isoformat()
                if doc['last_used']:
                    doc['last_used'] = doc['last_used'].isoformat()
                await db.tools.insert_one(doc)
                imported_count += 1
        
        elif request.format == "csv":
            csv_file = StringIO(request.data)
            csv_reader = csv.DictReader(csv_file)
            for row in csv_reader:
                tool_data = {
                    'title': row['title'],
                    'url': row['url'],
                    'description': row.get('description', ''),
                    'category_id': row.get('category_id', 'productivity'),
                    'tags': row.get('tags', '').split(',') if row.get('tags') else [],
                    'favicon': row.get('favicon', ''),
                    'user_id': request.user_id
                }
                tool = Tool(**tool_data)
                doc = tool.model_dump()
                doc['date_added'] = doc['date_added'].isoformat()
                if doc['last_used']:
                    doc['last_used'] = doc['last_used'].isoformat()
                await db.tools.insert_one(doc)
                imported_count += 1
        
        return {"message": f"Successfully imported {imported_count} tools"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")

@api_router.get("/tools/export/{format}")
async def export_tools(format: str, user_id: Optional[str] = None):
    """Export tools to CSV or JSON"""
    query = {}
    if user_id:
        query['user_id'] = user_id
    else:
        query['user_id'] = None
    
    tools = await db.tools.find(query, {"_id": 0}).to_list(1000)
    
    if format == "json":
        return {"data": tools}
    
    elif format == "csv":
        output = StringIO()
        if tools:
            fieldnames = ['id', 'title', 'url', 'description', 'category_id', 'tags', 'click_count', 'date_added']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            for tool in tools:
                row = {
                    'id': tool['id'],
                    'title': tool['title'],
                    'url': tool['url'],
                    'description': tool.get('description', ''),
                    'category_id': tool['category_id'],
                    'tags': ','.join(tool.get('tags', [])),
                    'click_count': tool.get('click_count', 0),
                    'date_added': tool['date_added']
                }
                writer.writerow(row)
        
        return {"data": output.getvalue()}
    
    raise HTTPException(status_code=400, detail="Invalid format. Use 'json' or 'csv'")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()