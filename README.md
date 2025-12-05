# 🪺 NodeNest

**Visual AI Tools Bookmark Manager**

A radial dashboard for organizing your AI tools. 100% offline, no account required.

[**Live Demo →**](https://ravenxrich.github.io/NodeNest/)

---

## Features

- **Radial Interface** – Drag-and-drop nodes on category rings
- **Local Storage** – Browser storage or save to your own folder
- **Mobile Sync** – QR code export with compression
- **Favorites** – Star tools for quick filtering
- **Search** – Find by title, description, or tags
- **Analytics** – Track your most-used tools
- **Dark/Light Mode** – System preference support
- **Import/Export** – JSON and CSV backup

---

## Quick Start

### Use Online
Visit [ravenxrich.github.io/NodeNest](https://ravenxrich.github.io/NodeNest/)

### Run Locally
```bash
git clone https://github.com/ravenxrich/NodeNest.git
cd NodeNest/frontend
yarn install
yarn start
```

---

## Storage Options

| Type | Description |
|------|-------------|
| **Folder** | Saves as `nodenest_tools.json` in a folder you choose |
| **Browser** | localStorage, single device |

---

## Categories

| Category | Color |
|----------|-------|
| AI Tools | Purple |
| Productivity | Cyan |
| Design | Pink |
| Development | Green |
| Writing | Amber |
| Research | Indigo |
| Automation | Red |
| Communication | Teal |
| Other | Slate |

---

## Tech Stack

- React 18 + React Router
- Tailwind CSS + Shadcn UI
- Framer Motion
- GitHub Pages

---

## Deploy

Push to `main` → Auto-deploys via GitHub Actions

```bash
# Or build manually
cd frontend && yarn build
```

---

## License

MIT

---

[ravenxrich](https://github.com/ravenxrich)
