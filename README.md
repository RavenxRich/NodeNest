# NodeNest - Visual AI Tools Dashboard

🎨 A beautiful radial dashboard for organizing your AI tools and bookmarks.

## ✨ Features

- 🎯 **Radial Dashboard**: Organize tools in 8 category rings
- 🏷️ **Smart Tags**: Tag and categorize your tools
- ⭐ **Favorites**: Quick access to your most-used tools
- 🔍 **Search**: Find tools instantly
- 💾 **Local Storage**: Browser storage or folder-based (File System API)
- 🎨 **Drag & Drop**: Rearrange tools between categories
- 📤 **Export/Import**: Backup your data as JSON or CSV

## 🚀 Live Demo

Visit: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## 🛠️ Tech Stack

- React 18
- Framer Motion (animations)
- TailwindCSS (styling)
- Shadcn UI (components)
- File System Access API (folder storage)

## 📦 Project Structure

```
/
├── index.html              # Main HTML entry
├── static/
│   ├── css/               # Compiled CSS
│   └── js/                # Compiled JavaScript
├── .github/
│   └── workflows/
│       └── deploy.yml     # Auto-deploy to GitHub Pages
└── GITHUB_PAGES_DEPLOY.md # Deployment guide
```

## 🚀 Deployment

This site is deployed via GitHub Pages.

See [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md) for detailed instructions.

### Quick Deploy:

1. Push to GitHub
2. Settings → Pages → Source: GitHub Actions
3. Done! Site auto-deploys on every push.

## 💾 Storage Options

### Browser Storage (Default)
- Uses encrypted localStorage
- Works everywhere
- Data persists in browser

### Folder Storage
- Uses File System Access API
- Choose a folder on your computer
- Data saved as `nodenest_tools.json`
- Works in Chrome, Edge, Brave

## 🎯 Usage

1. **Choose Storage**: Browser or Folder
2. **Add Tools**: Click "+ Add Tool"
3. **Organize**: Drag nodes between category rings
4. **Tag**: Add tags to tools
5. **Favorite**: Star your most-used tools
6. **Export**: Backup your data anytime

## 📝 License

MIT

## 🙏 Acknowledgments

Built with [Emergent](https://emergent.sh)
