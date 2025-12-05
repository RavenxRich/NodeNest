# 🪺 NodeNest

<div align="center">

  ![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.x-FF0066?style=for-the-badge&logo=framer&logoColor=white)
  ![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Ready-222?style=for-the-badge&logo=github&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

  <br />
  
  <h2>✨ Visual AI Tools Bookmark Manager ✨</h2>
  
  <p>
    A beautiful radial dashboard for organizing your AI tools.<br/>
    <strong>100% offline</strong> • <strong>No account required</strong> • <strong>Your data stays local</strong>
  </p>

  <br />
  
  [**🌐 Live Demo**](https://ravenxrich.github.io/NodeNest/) · [**🐛 Report Bug**](https://github.com/ravenxrich/NodeNest/issues) · [**✨ Request Feature**](https://github.com/ravenxrich/NodeNest/issues)

</div>

---

## 🎯 What is NodeNest?

NodeNest is a **visual bookmark manager** designed specifically for AI tools. Instead of a boring list, your tools are displayed on a beautiful **radial canvas** where you can:

- **Drag & drop** tools between category rings
- **Search** instantly across all your tools
- **Track usage** with built-in analytics
- **Sync to mobile** via QR codes
- **Export/Import** your collection anytime

All data is stored **locally in your browser** or in a **folder you choose** - no accounts, no cloud, no tracking.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Radial Interface** | Drag-and-drop nodes on beautiful category rings |
| 💾 **Persistent Storage** | Data survives browser refresh - localStorage or File System |
| 📁 **Folder Storage** | Save to your own folder as `nodenest_tools.json` |
| 📱 **Mobile Sync** | QR code export with automatic compression |
| 🤖 **Smart Extraction** | Auto-fetch title, favicon, and description from URLs |
| ⭐ **Favorites** | Star your most-used tools for quick filtering |
| 🔍 **Instant Search** | Find tools by title, description, or tags |
| 📊 **Usage Analytics** | Charts showing your most-used tools |
| 🌙 **Dark/Light Mode** | Beautiful themes that respect your preference |
| 🏷️ **9 Categories** | AI Tools, Productivity, Design, Development, and more |
| 📤 **Import/Export** | JSON and CSV support for backups |

---

## 🚀 Quick Start

### Option 1: Use Online (Recommended)

Visit **[https://ravenxrich.github.io/NodeNest/](https://ravenxrich.github.io/NodeNest/)** and start adding tools!

### Option 2: Run Locally

```bash
git clone https://github.com/ravenxrich/NodeNest.git
cd NodeNest/frontend
yarn install
yarn start
```

---

## 💾 Storage Options

Choose how you want to store your data:

| Storage Type | Persistence | Portability | Best For |
|--------------|-------------|-------------|----------|
| **📁 Folder Storage** | Permanent | Copy the JSON file anywhere | Power users who want full control |
| **🌐 Browser Storage** | Per-browser | Use QR sync for mobile | Quick setup, single device |

### Folder Storage Flow

```
First Visit                          Return Visit
───────────                          ────────────
     │                                    │
     ▼                                    ▼
┌─────────────┐                    ┌─────────────────┐
│ Select      │                    │ Welcome Back!   │
│ Folder      │                    │                 │
└─────────────┘                    │ 📁 MyFolder/    │
     │                             │                 │
     ▼                             │ [Continue]      │
┌─────────────┐                    └─────────────────┘
│ nodenest_   │                           │
│ tools.json  │◄──────────────────────────┘
│ created     │         (one-click confirm)
└─────────────┘
```

Your folder is **remembered** - just confirm access when you return!

---

## 🎨 Categories

9 color-coded categories to organize your tools:

| Category | Color | Example Tools |
|----------|-------|---------------|
| 🟣 **AI Tools** | Purple | ChatGPT, Claude, Gemini |
| 🔵 **Productivity** | Cyan | Notion, Todoist, Calendar |
| 🩷 **Design** | Pink | Figma, Canva, Midjourney |
| 🟢 **Development** | Green | GitHub, VS Code, Cursor |
| 🟡 **Writing** | Amber | Grammarly, Jasper, Copy.ai |
| 🔮 **Research** | Indigo | Perplexity, Elicit, Consensus |
| 🔴 **Automation** | Red | Zapier, Make, n8n |
| 🌊 **Communication** | Teal | Slack, Discord, Zoom |
| ⚫ **Other** | Slate | Everything else |

---

## 📱 Mobile Sync

Share your tools collection to your phone:

1. Click **"Export to Mobile"** button
2. Scan the QR code with your phone
3. Tools are imported automatically!

**How it handles large collections:**
- Small (< 2KB): Direct URL in QR code
- Large: Compressed format with sync code fallback
- Huge: Copy to clipboard option

---

## 🏗️ Project Structure

```
NodeNest/
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── ui/         # 40+ Shadcn components
│   │   │   ├── RadialCanvas.js
│   │   │   ├── ToolNode.js
│   │   │   └── ...
│   │   ├── pages/          # Route pages
│   │   │   ├── Landing.js  # Storage selection
│   │   │   ├── Dashboard.js # Main canvas
│   │   │   ├── Settings.js
│   │   │   └── Stats.js
│   │   ├── contexts/       # React Context
│   │   │   └── StorageContext.js
│   │   └── utils/          # Helpers
│   │       ├── constants.js
│   │       ├── compression.js
│   │       ├── encryption.js
│   │       └── indexedDB.js
│   └── public/
│       ├── index.html
│       └── 404.html        # SPA routing
├── .github/workflows/
│   └── deploy.yml          # Auto-deploy to GitHub Pages
└── README.md
```

---

## ⚡ Performance

Built for speed with React best practices:

| Optimization | Implementation |
|--------------|----------------|
| **Memoization** | `React.memo` on ToolNode, RadialCanvas |
| **Computed Values** | `useMemo` for filtered tools, ring calculations |
| **Stable Callbacks** | `useCallback` for all handlers |
| **Lazy Images** | `loading="lazy"` on all favicons |
| **Immediate Persistence** | Data saved on every change |

---

## 🔐 Privacy & Security

- ✅ **No accounts** - Start using immediately
- ✅ **No tracking** - We don't collect any data
- ✅ **No cloud** - Everything stays on your device
- ✅ **Encrypted storage** - localStorage data is XOR encrypted
- ✅ **Open source** - Audit the code yourself

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18.3.1 |
| **Routing** | React Router 7.x |
| **Styling** | Tailwind CSS 3.4 |
| **Components** | Shadcn UI + Radix |
| **Animations** | Framer Motion 12.x |
| **Charts** | Recharts 3.x |
| **Icons** | Lucide React |
| **QR Codes** | qrcode.react |
| **Build** | Create React App + CRACO |
| **Deploy** | GitHub Pages + Actions |

---

## 🚢 Deployment

### GitHub Pages (Default)

Push to `main` → Auto-deploys via GitHub Actions

### Self-Host

```bash
cd frontend
yarn build
# Serve the `build/` folder with any static host
```

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/ ./
RUN yarn install --frozen-lockfile && yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feature/cool-feature`
3. Commit: `git commit -m 'Add cool feature'`
4. Push: `git push origin feature/cool-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - do whatever you want with it!

---

## 🙏 Credits

- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Primitives
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide](https://lucide.dev/) - Icons
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

<div align="center">
  
  **[🌐 Try NodeNest Now](https://ravenxrich.github.io/NodeNest/)**
  
  <br />
  
  Made with ❤️ by [ravenxrich](https://github.com/ravenxrich)
  
  <br />
  
  ⭐ **Star this repo** if you find it useful!

</div>
