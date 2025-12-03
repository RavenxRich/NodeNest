# Vercel serverless function entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import re
import aiohttp

# Create FastAPI app
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Categories (static data)
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

# Known AI tools for metadata extraction
KNOWN_TOOLS = {
    "claude.ai": {
        "title": "Claude",
        "description": "Anthropic's AI assistant for tasks of any size",
        "category_id": "chat-assistants",
        "tags": ["ai", "chatbot", "assistant"],
        "favicon": "https://claude.ai/favicon.ico"
    },
    "chat.openai.com": {
        "title": "ChatGPT",
        "description": "OpenAI's conversational AI model",
        "category_id": "chat-assistants",
        "tags": ["ai", "chatbot", "gpt"],
        "favicon": "https://chat.openai.com/favicon.ico"
    },
    "gemini.google.com": {
        "title": "Gemini",
        "description": "Google's most capable AI model",
        "category_id": "chat-assistants",
        "tags": ["ai", "google", "chatbot"],
        "favicon": "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64"
    },
    "github.com": {
        "title": "GitHub Copilot",
        "description": "AI pair programmer",
        "category_id": "code-dev",
        "tags": ["ai", "coding", "development"],
        "favicon": "https://github.com/favicon.ico"
    },
    "midjourney.com": {
        "title": "Midjourney",
        "description": "AI image generation",
        "category_id": "image-video",
        "tags": ["ai", "image", "generation"],
        "favicon": "https://www.midjourney.com/favicon.ico"
    }
}

@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "status": "ok",
        "message": "NodeNest API running on Vercel",
        "version": "1.0.0"
    }

@app.get("/api/categories")
async def get_categories():
    """Get all categories"""
    return DEFAULT_CATEGORIES

@app.post("/api/tools/extract-metadata")
async def extract_metadata(data: dict):
    """Extract metadata from URL - simplified for Vercel"""
    try:
        url = data.get("url", "")
        
        # Normalize URL
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Extract domain
        domain_match = re.search(r'https?://(?:www\.)?([^/]+)', url)
        if not domain_match:
            return {
                "title": "Unknown Tool",
                "description": "AI tool",
                "category_id": "chat-assistants",
                "tags": ["ai"],
                "favicon": ""
            }
        
        domain = domain_match.group(1)
        
        # Check if it's a known tool
        for known_domain, metadata in KNOWN_TOOLS.items():
            if known_domain in domain:
                return metadata
        
        # Try to fetch metadata from the actual page
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }) as resp:
                    html = await resp.text()
                    
                    # Extract title
                    title_match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
                    og_title_match = re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                    title = (og_title_match.group(1) if og_title_match else 
                            title_match.group(1) if title_match else 
                            domain.split('.')[0].title())
                    
                    # Extract description
                    desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                    og_desc_match = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                    description = (og_desc_match.group(1) if og_desc_match else 
                                  desc_match.group(1) if desc_match else 
                                  f"AI tool from {domain}")
                    
                    # Clean up text
                    title = re.sub(r'\s+', ' ', title).strip()
                    description = re.sub(r'\s+', ' ', description).strip()[:200]
                
        except Exception as e:
            # Fallback if fetch fails
            title = domain.split('.')[0].title()
            description = f"AI tool from {domain}"
        
        # Determine category based on domain keywords
        category_id = "chat-assistants"
        if any(word in domain.lower() for word in ["github", "code", "dev", "git"]):
            category_id = "code-dev"
        elif any(word in domain.lower() for word in ["chat", "gpt", "claude", "gemini"]):
            category_id = "chat-assistants"
        elif any(word in domain.lower() for word in ["image", "video", "photo", "midjourney", "dall"]):
            category_id = "image-video"
        elif any(word in domain.lower() for word in ["write", "blog", "content", "copy"]):
            category_id = "writing-content"
        elif any(word in domain.lower() for word in ["voice", "audio", "sound"]):
            category_id = "audio-voice"
        
        return {
            "title": title,
            "description": description,
            "category_id": category_id,
            "tags": ["ai", "tool"],
            "favicon": f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
        }
        
    except Exception as e:
        return {
            "title": "Unknown Tool",
            "description": str(e),
            "category_id": "chat-assistants",
            "tags": ["ai"],
            "favicon": ""
        }

# Mangum handler for Vercel
handler = Mangum(app, lifespan="off")
