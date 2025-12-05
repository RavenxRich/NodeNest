# NodeNest

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-12.x-FF0066?style=for-the-badge&logo=framer" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/GitHub_Pages-Ready-222?style=for-the-badge&logo=github" alt="GitHub Pages" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</div>

<br />

<div align="center">
  <h3>✨ Visual AI Tools Bookmark Manager ✨</h3>
  <p>A beautiful, radial dashboard for organizing and managing your AI tools bookmarks.<br/>Works 100% offline on GitHub Pages - no backend required!</p>
  
  🔗 **[Live Demo](https://ravenxrich.github.io/NodeNest/)**
</div>

---

## 📸 Features

| Feature | Description |
|---------|-------------|
| 🎯 **Radial Interface** | Visual organization with draggable nodes on category rings |
| 💾 **Persistent Storage** | Browser localStorage or File System API - data survives refresh |
| 📁 **Folder Storage** | Save to your own folder using File System Access API |
| 📱 **Mobile Sync** | QR code export/import with automatic data compression |
| 🤖 **AI Metadata** | Auto-extract tool info (falls back to basic extraction offline) |
| ⭐ **Favorites** | Mark and filter your most-used tools |
| 🔍 **Search** | Quickly find tools by title, description, or tags |
| 📊 **Usage Analytics** | Track clicks, visualize category distribution with charts |
| 🌙 **Dark/Light Mode** | Beautiful themes with smooth transitions |
| 🏷️ **Tags & Categories** | Organize tools with custom tags and 9 color-coded categories |
| 📤 **Import/Export** | JSON and CSV support for backups and migrations |
| ☁️ **Cloud Sync** | Optional Google OAuth (requires backend) |

---

## 🚀 Quick Start

### Live Demo
Visit **[https://ravenxrich.github.io/NodeNest/](https://ravenxrich.github.io/NodeNest/)** - no installation needed!

### Local Development

```bash
# Clone the repository
git clone https://github.com/ravenxrich/NodeNest.git
cd NodeNest/frontend

# Install dependencies
yarn install

# Start development server
yarn start
```

The app opens at `http://localhost:3000`

### Build for Production

```bash
yarn build
```

---

## 🌐 GitHub Pages Deployment

NodeNest is designed to work **100% on GitHub Pages** without any backend:

### How It Works

| Feature | GitHub Pages (No Backend) | With Backend |
|---------|--------------------------|--------------|
| **Local Storage** | ✅ Full support | ✅ Full support |
| **File System Storage** | ✅ Chrome/Edge/Brave | ✅ Chrome/Edge/Brave |
| **AI Metadata Extraction** | ✅ Basic client-side | ✅ Claude/GPT/Gemini |
| **QR Code Sync** | ✅ Full support | ✅ Full support |
| **Import/Export** | ✅ JSON & CSV | ✅ JSON & CSV |
| **Cloud Sync** | ❌ Not available | ✅ Google OAuth |

### Automatic Deployment

Push to `main` branch → GitHub Actions builds → Deploys to GitHub Pages

```yaml
# .github/workflows/deploy.yml handles everything
on:
  push:
    branches: [main]
```

### SPA Routing

The app uses client-side routing with React Router. The `404.html` handles GitHub Pages SPA routing:
- `/NodeNest/dashboard` → Works ✅
- `/NodeNest/settings` → Works ✅
- `/NodeNest/stats` → Works ✅

---

## 📁 Project Structure

```
NodeNest/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD
├── frontend/
│   ├── public/
│   │   ├── index.html      # Main HTML with SPA redirect script
│   │   └── 404.html        # GitHub Pages SPA routing handler
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # Shadcn UI components (40+ components)
│   │   │   ├── AddNodeModal.js
│   │   │   ├── MobileQRCode.js
│   │   │   ├── NodeDetailsSidebar.js
│   │   │   ├── RadialCanvas.js
│   │   │   └── ToolNode.js
│   │   ├── contexts/
│   │   │   └── StorageContext.js  # Global state & storage logic
│   │   ├── pages/
│   │   │   ├── Dashboard.js   # Main radial canvas view
│   │   │   ├── Landing.js     # Storage selection screen
│   │   │   ├── Settings.js    # LLM config & import/export
│   │   │   └── Stats.js       # Usage analytics & charts
│   │   ├── utils/
│   │   │   ├── compression.js # QR code data compression
│   │   │   ├── constants.js   # Categories, storage keys
│   │   │   ├── encryption.js  # XOR cipher for local data
│   │   │   └── indexedDB.js   # File handle persistence
│   │   ├── hooks/
│   │   │   └── use-toast.js
│   │   ├── lib/
│   │   │   └── utils.js       # Tailwind utilities
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── craco.config.js
├── .gitignore
├── .nojekyll
└── README.md
```

---

## 🔧 Technical Architecture

### Performance Optimizations

All components are optimized for production:

| Component | Optimizations |
|-----------|--------------|
| **ToolNode** | `React.memo`, `useCallback` for drag handlers |
| **RadialCanvas** | `React.memo`, `useMemo` for ring calculations |
| **Dashboard** | `useMemo` for filtered tools |
| **StorageContext** | `useCallback` for all storage operations |

### Storage System

```
┌─────────────────────────────────────────────────────────┐
│                    StorageContext                        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Browser    │  │  File System │  │    Cloud     │  │
│  │  localStorage│  │   API        │  │  (optional)  │  │
│  │              │  │              │  │              │  │
│  │  • Encrypted │  │  • JSON file │  │  • Google    │  │
│  │  • XOR cipher│  │  • IndexedDB │  │    OAuth     │  │
│  │  • Instant   │  │    handles   │  │  • Backend   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Categories

9 built-in categories with distinct colors:

| Category | Color | ID |
|----------|-------|-----|
| AI Tools | `#8B5CF6` | `ai_tools` |
| Productivity | `#06B6D4` | `productivity` |
| Design | `#EC4899` | `design` |
| Development | `#10B981` | `development` |
| Writing | `#F59E0B` | `writing` |
| Research | `#6366F1` | `research` |
| Automation | `#EF4444` | `automation` |
| Communication | `#14B8A6` | `communication` |
| Other | `#64748B` | `other` |

---

## 📱 Mobile Sync

Sync your tools to mobile via QR code:

### How It Works

1. **Small datasets** (< 2KB): Direct URL encoding in QR code
2. **Large datasets**: Compressed minimal format with sync code fallback
3. **Clipboard backup**: Copy full encrypted data manually

### Data Compression

```javascript
// Full tool object → Minimal sync format
{
  title: "ChatGPT",           →  { t: "ChatGPT",
  url: "https://...",              u: "https://...",
  category_id: "ai_tools",         c: "ai_tools",
  favicon: "https://...",          f: "https://...",
  favorite: true                   v: 1 }
}
// ~60% size reduction
```

---

## 🔐 Security

- **Local encryption**: XOR cipher with base64 encoding for localStorage
- **No data leaves your browser**: Everything stored locally by default
- **IndexedDB for handles**: File System API handles persist securely
- **HTTPS required**: File System Access API only works over HTTPS

---

## ⚙️ Configuration

### Environment Variables (Optional)

Create `.env` in `/frontend`:

```env
# Backend API (optional - app works fully without it)
REACT_APP_BACKEND_URL=https://your-backend.com

# Google OAuth (optional - for cloud sync)
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### LLM Providers

When backend is available, configure AI metadata extraction in Settings:
- **Anthropic** - Claude Sonnet 4
- **OpenAI** - GPT-5.1
- **Google** - Gemini 2.5 Flash
- **Local** - Ollama, LMStudio (OpenAI-compatible endpoint)

Without backend: Basic client-side metadata extraction (title from URL, Google favicon)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18.3.1 |
| **Routing** | React Router 7.x |
| **Styling** | Tailwind CSS 3.4 + Shadcn UI |
| **Animations** | Framer Motion 12.x |
| **Charts** | Recharts 3.x |
| **Icons** | Lucide React |
| **QR Codes** | qrcode.react |
| **Build Tool** | Create React App + CRACO |
| **Deployment** | GitHub Pages + GitHub Actions |

---

## 🚢 Alternative Deployment

### Vercel / Netlify

```bash
cd frontend
yarn build
# Deploy the `build/` folder
```

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/ ./
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) - Beautiful component primitives
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide](https://lucide.dev/) - Icons
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/ravenxrich">ravenxrich</a></p>
  
  <p>
    <a href="https://ravenxrich.github.io/NodeNest/">🌐 Live Demo</a> •
    <a href="https://github.com/ravenxrich/NodeNest/issues">🐛 Report Bug</a> •
    <a href="https://github.com/ravenxrich/NodeNest/issues">✨ Request Feature</a>
  </p>
  
  <br />
  
  <sub>⭐ Star this repo if you find it useful!</sub>
</div>
