# NodeNest - Vercel Deployment Guide

## Tech Stack Clarification

**NodeNest is NOT NestJS!** It's:
- **Frontend**: React (built with Create React App)
- **Backend**: Python FastAPI (serverless on Vercel)
- **Database**: MongoDB (optional, works with browser storage too)

The name "NodeNest" refers to organizing AI tool "nodes" visually, not Node.js framework.

## Structure Ready for Vercel

The project is now configured for Vercel deployment:

```
/app/
├── index.html              ← Frontend entry point (React build)
├── static/                 ← React JS/CSS bundles
├── api/                    ← Vercel serverless functions
│   ├── index.py           ← Entry point for FastAPI
│   └── requirements.txt   ← Python dependencies
├── backend/               ← FastAPI application code
│   └── server.py          ← Main FastAPI app
└── vercel.json            ← Vercel configuration
```

## Changes Made for Vercel

### 1. Removed Private Package
- **Removed**: `emergentintegrations==0.1.0` from requirements.txt
- **Reason**: Not available on PyPI, causes build failures
- **Impact**: Metadata extraction now uses simple URL parsing fallback

### 2. Optimized Dependencies (SIZE REDUCTION!)
- **Reduced from**: 124 packages to 8 essential packages
- **Removed**: Heavy packages like boto3, google-ai, huggingface_hub, litellm, pandas, numpy, etc.
- **Kept only**: fastapi, motor, pymongo, uvicorn, aiohttp, pydantic, python-dotenv, dnspython
- **Result**: Function size reduced from 250+ MB to ~50 MB ✅

### 3. Static Files Moved to Root
- Built React app with `npm run build`
- Moved all build output to `/app/` root
- Vercel can now serve static files correctly

### 4. Vercel Configuration Optimized
- Created `vercel.json` with proper routing
- Set `maxLambdaSize` to 50mb
- Added memory and timeout configuration
- Routes `/api/*` to backend Python functions
- Serves static files from root

### 5. Added .vercelignore
- Excludes frontend source code (only deploys build)
- Excludes cache files and development dependencies
- Excludes test files and documentation
- **Result**: Faster deployments and smaller function size

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Vercel will auto-detect settings

3. **Environment Variables**
   Add these in Vercel dashboard:
   - `MONGO_URL` - Your MongoDB connection string
   - Any other API keys needed

4. **Deploy!**
   - Vercel will build and deploy automatically
   - Get your live URL

## Notes

- MongoDB connection will need to be set up with MongoDB Atlas or similar
- The app uses browser storage by default (works without MongoDB)
- Folder storage feature requires browser API support
