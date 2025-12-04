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
/
├── .github/
│   └── workflows/     # GitHub Actions for auto-deploy
├── frontend/          # React source code
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components (Landing, Dashboard, Settings, Stats)
│   │   ├── contexts/    # React contexts (StorageContext)
│   │   └── utils/       # Utility functions
│   └── public/        # Static assets
├── static/            # Built assets (deployed to GitHub Pages)
│   ├── css/           # Compiled CSS
│   └── js/            # Compiled JavaScript
├── index.html         # Main HTML (deployed)
├── 404.html           # Fallback for SPA client-side routing
└── README.md          # This file
```

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
