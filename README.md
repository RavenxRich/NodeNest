# NodeNest

A visual AI tools bookmark manager with radial interface for organizing your favorite tools.

🌐 **Live Site**: [https://ravenxrich.github.io/NodeNest/](https://ravenxrich.github.io/NodeNest/)

## Features

- 📁 **Folder Storage** - Save tools to your local file system
- ☁️ **Cloud Storage** - Sync across devices with Google Sign-In
- 🎯 **Radial Interface** - Visual organization inspired by orbital mechanics
- 📱 **Mobile Sync** - QR code export/import for mobile devices
- 🎨 **Dark/Light Mode** - Beautiful themes for any preference
- ⭐ **Favorites** - Mark and filter your most-used tools
- 🔍 **Search** - Quickly find any tool
- 📊 **Usage Stats** - Track which tools you use most

## Tech Stack

- **Frontend**: React 18.3.1
- **UI**: Tailwind CSS + Shadcn UI
- **Animations**: Framer Motion
- **Storage**: Local File System API + Google OAuth
- **Deployment**: GitHub Pages

## Project Structure

```
NodeNest/                    (GitHub Pages Deployment)
├── .github/
│   └── workflows/          # Auto-deployment via GitHub Actions
├── frontend/               # React source code (for development)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Landing, Dashboard, Settings, Stats
│   │   ├── contexts/      # StorageContext (folder/cloud storage)
│   │   └── utils/         # Helper functions
│   ├── public/            # Static assets
│   └── package.json       # Dependencies
├── static/                # Built assets (served by GitHub Pages)
│   ├── css/              # Compiled stylesheets
│   └── js/               # Compiled React bundle
├── index.html             # Main entry point
├── 404.html               # SPA routing fallback
├── .gitignore             # Excludes node_modules, build artifacts
├── .nojekyll              # Disables Jekyll processing
└── README.md              # Documentation
```

**Only 4 essential items on GitHub:**
- `index.html` & `404.html` - Entry points
- `static/` - Compiled app
- `.github/workflows/` - Auto-deployment

## Development

This project uses React with Create React App. To develop locally:

1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `yarn install`
3. Start dev server: `yarn start`
4. Build for production: `yarn build`

## Deployment

The site automatically deploys to GitHub Pages via GitHub Actions on every push to `main` branch.

Built files are in the root directory (`/index.html`, `/static/`) for GitHub Pages compatibility.

---

**Built with ❤️ using [Emergent](https://emergent.sh)**
