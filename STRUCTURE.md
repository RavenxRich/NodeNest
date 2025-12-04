# NodeNest Project Structure

## 📁 Root Directory (GitHub Pages Deployment)

```
/app/
├── .github/              # GitHub Actions workflows
│   └── workflows/
│       └── deploy.yml    # Auto-deploy to GitHub Pages
├── .gitignore            # Git ignore rules
├── .nojekyll             # Disable Jekyll on GitHub Pages
├── README.md             # Project documentation
├── index.html            # Main entry point (built)
├── 404.html              # SPA fallback route (copy of index.html)
└── static/               # Built assets
    ├── css/
    │   └── main.*.css    # Compiled styles
    └── js/
        └── main.*.js     # Compiled React bundle
```

## 🔧 Frontend Source (Development)

```
/app/frontend/
├── public/               # Static assets template
│   └── index.html        # HTML template
├── src/
│   ├── components/       # Reusable React components
│   │   ├── ui/          # Shadcn UI components
│   │   ├── AddNodeModal.js
│   │   ├── MobileQRCode.js
│   │   ├── NodeDetailsSidebar.js
│   │   ├── RadialCanvas.js
│   │   └── ToolNode.js
│   ├── contexts/        # React Context providers
│   │   └── StorageContext.js
│   ├── pages/           # Page components
│   │   ├── Dashboard.js
│   │   ├── Landing.js
│   │   ├── Settings.js
│   │   └── Stats.js
│   ├── utils/           # Utility functions
│   │   ├── encryption.js
│   │   └── fileStorage.js
│   ├── App.js           # Root component
│   └── App.css          # Global styles
├── .env                 # Environment variables
├── package.json         # Dependencies & scripts
├── tailwind.config.js   # Tailwind CSS config
└── craco.config.js      # Build configuration
```

## 🚀 Deployment Flow

1. **Development**: Edit files in `/app/frontend/src/`
2. **Build**: `cd frontend && yarn build`
3. **Copy**: Build output copied from `frontend/build/` to `/app/`
4. **Deploy**: GitHub Actions deploys `/app/` to GitHub Pages
5. **Live**: https://ravenxrich.github.io/NodeNest/

## 📦 Key Files Explained

### Root Files (Deployed)
- **index.html**: Main HTML with React bundle references
- **404.html**: Same as index.html (handles SPA client-side routing)
- **static/**: Contains hashed JS/CSS bundles
- **.nojekyll**: Tells GitHub Pages not to use Jekyll processing

### Source Files (Development)
- **src/App.js**: React router setup with basename="/NodeNest"
- **src/contexts/StorageContext.js**: Handles folder/cloud storage logic
- **src/components/MobileQRCode.js**: QR code export/import feature
- **.env**: Contains PUBLIC_URL and Google OAuth Client ID

## 🔒 Environment Variables

Located in `/app/frontend/.env`:
```
PUBLIC_URL=/NodeNest
REACT_APP_BACKEND_URL=
REACT_APP_GOOGLE_CLIENT_ID=874192286034-tkrpvjoifv7ievqetd51svgimmtlqq06.apps.googleusercontent.com
GENERATE_SOURCEMAP=false
```

## 🎯 Build Commands

```bash
# Install dependencies
cd frontend && yarn install

# Development server
yarn start

# Production build
yarn build

# Build output goes to: frontend/build/
# Then copied to: /app/ (root)
```

## ✨ Clean Structure Benefits

- ✅ Root only contains deployed files (no clutter)
- ✅ Frontend source separated in `/frontend/`
- ✅ GitHub Pages serves from root correctly
- ✅ Easy to understand and maintain
- ✅ No unnecessary files in deployment
