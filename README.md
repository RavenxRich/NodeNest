# NodeNest

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-12.x-FF0066?style=for-the-badge&logo=framer" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</div>

<br />

<div align="center">
  <h3>✨ Visual AI Tools Bookmark Manager ✨</h3>
  <p>A beautiful, radial dashboard for organizing and managing your AI tools bookmarks with persistent storage and mobile sync.</p>
  
  🔗 **[Live Demo](https://ravenxrich.github.io/NodeNest/)**
</div>

---

## 📸 Features

| Feature | Description |
|---------|-------------|
| 🎯 **Radial Interface** | Visual organization with draggable nodes on category rings |
| 💾 **Persistent Storage** | Browser localStorage or File System API for local files |
| ☁️ **Cloud Sync** | Optional Google OAuth for cross-device sync |
| 📱 **Mobile Sync** | QR code export/import with data compression |
| 🤖 **AI Metadata** | Auto-extract tool info using Claude/GPT/Gemini |
| ⭐ **Favorites** | Mark and filter your most-used tools |
| 🔍 **Search** | Quickly find tools by title, description, or tags |
| 📊 **Usage Analytics** | Track clicks, visualize category distribution |
| 🌙 **Dark/Light Mode** | Beautiful themes with smooth transitions |
| 🏷️ **Tags & Categories** | Organize tools with custom tags and 9 categories |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ravenxrich/NodeNest.git
cd NodeNest/frontend

# Install dependencies
yarn install

# Start development server
yarn start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
yarn build
```

---

## 📁 Project Structure

```
NodeNest/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── frontend/               # React application
│   ├── public/
│   │   ├── index.html     # HTML template
│   │   └── 404.html       # SPA routing fallback
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/        # Shadcn UI components
│   │   │   ├── AddNodeModal.js
│   │   │   ├── MobileQRCode.js
│   │   │   ├── NodeDetailsSidebar.js
│   │   │   ├── RadialCanvas.js
│   │   │   └── ToolNode.js
│   │   ├── contexts/
│   │   │   └── StorageContext.js  # Global state & storage
│   │   ├── pages/
│   │   │   ├── Dashboard.js   # Main radial view
│   │   │   ├── Landing.js     # Storage selection
│   │   │   ├── Settings.js    # LLM & import/export
│   │   │   └── Stats.js       # Usage analytics
│   │   ├── utils/
│   │   │   ├── compression.js # QR code data compression
│   │   │   ├── constants.js   # Categories & storage keys
│   │   │   ├── encryption.js  # Local data encryption
│   │   │   ├── fileStorage.js # File System API helpers
│   │   │   └── indexedDB.js   # IndexedDB utilities
│   │   ├── hooks/
│   │   │   └── use-toast.js   # Toast notifications
│   │   ├── lib/
│   │   │   └── utils.js       # Tailwind utilities
│   │   ├── App.js             # Main app component
│   │   ├── App.css            # Global styles
│   │   └── index.js           # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── craco.config.js
├── .gitignore
├── .nojekyll
└── README.md
```

---

## 🔧 Technical Architecture

### State Management
- **StorageContext** - React Context for global state
- **useCallback/useMemo** - Optimized re-renders throughout
- **Immediate Persistence** - Data saved on every change

### Storage Options

| Option | Description | Use Case |
|--------|-------------|----------|
| **Browser Storage** | localStorage with XOR encryption | Default, works everywhere |
| **File System** | Native file via File System Access API | Chrome/Edge/Brave only |
| **Cloud** | Google OAuth + backend API | Cross-device sync |

### Performance Optimizations
- `React.memo()` on heavy components (ToolNode, RadialCanvas)
- `useMemo()` for computed values (filtered tools, ring calculations)
- `useCallback()` for event handlers
- Lazy loading for images
- Compressed QR code data for mobile sync

### Categories
9 built-in categories with distinct colors:
- AI Tools (`#8B5CF6`)
- Productivity (`#06B6D4`)
- Design (`#EC4899`)
- Development (`#10B981`)
- Writing (`#F59E0B`)
- Research (`#6366F1`)
- Automation (`#EF4444`)
- Communication (`#14B8A6`)
- Other (`#64748B`)

---

## 📱 Mobile Sync

NodeNest supports mobile sync via QR codes:

1. **Small datasets** (< 2KB) - Direct URL encoding in QR
2. **Large datasets** - Compressed minimal format + sync code fallback
3. **Clipboard backup** - Copy full encrypted data manually

The compression system:
- Removes unnecessary fields (only keeps title, url, category, favicon, tags, favorite)
- Uses single-character keys to minimize JSON size
- Falls back gracefully when data exceeds QR limits

---

## 🔐 Security

- **Local encryption** - XOR cipher with base64 encoding
- **No backend required** - All data stays in your browser
- **IndexedDB for handles** - File System API handles persist securely
- **HTTPS only** - Required for File System Access API

---

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in `/frontend`:

```env
# Backend API (optional, for cloud features)
REACT_APP_BACKEND_URL=https://your-backend.com

# Google OAuth (optional, for cloud sync)
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### LLM Providers for AI Metadata Extraction

Configure in Settings page:
- **Anthropic** - Claude Sonnet 4 (recommended)
- **OpenAI** - GPT-5.1
- **Google** - Gemini 2.5 Flash
- **Local** - Any OpenAI-compatible endpoint (Ollama, LMStudio)

---

## 🚢 Deployment

### GitHub Pages (Default)

The app auto-deploys to GitHub Pages via GitHub Actions on push to `main`.

**Live URL:** https://ravenxrich.github.io/NodeNest/

### Custom Deployment

1. Build the production bundle:
   ```bash
   cd frontend && yarn build
   ```

2. Deploy the `build/` directory to any static host:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static file server

---

## 📊 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18.3.1 |
| **Routing** | React Router 7.x |
| **Styling** | Tailwind CSS 3.4 + Shadcn UI |
| **Animations** | Framer Motion 12.x |
| **Charts** | Recharts 3.x |
| **Icons** | Lucide React |
| **Auth** | @react-oauth/google |
| **QR Codes** | qrcode.react |
| **Build Tool** | Create React App + CRACO |
| **Package Manager** | Yarn |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for beautiful component primitives
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/ravenxrich">ravenxrich</a></p>
  <p>
    <a href="https://ravenxrich.github.io/NodeNest/">Live Demo</a> •
    <a href="https://github.com/ravenxrich/NodeNest/issues">Report Bug</a> •
    <a href="https://github.com/ravenxrich/NodeNest/issues">Request Feature</a>
  </p>
</div>
