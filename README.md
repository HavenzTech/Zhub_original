# Havenz Hub - Organizational Intelligence Platform

<div align="center">

![Havenz Hub Logo](https://img.shields.io/badge/Havenz-Hub-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K)

**Secure • Modern • Responsive • Enterprise-Ready**

A comprehensive organizational intelligence and management platform built with Next.js 15, TypeScript, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Responsive](https://img.shields.io/badge/Responsive-All%20Devices-green?style=flat-square)]()

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [AI-Assisted Development](#ai-assisted-development)
- [Responsive Design](#responsive-design)
- [Components](#components)
- [Customization](#customization)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

Havenz Hub is a modern, secure, and fully responsive organizational intelligence platform designed for enterprise use. It provides comprehensive tools for managing companies, projects, departments, documents, and workflows in a unified, user-friendly interface.

### Key Highlights

- 🔒 **Security-First**: On-premise deployment with blockchain auditing
- 📱 **Fully Responsive**: Optimized for all devices (320px to 4K+)
- ⚡ **High Performance**: Built with Next.js 15 and modern optimization techniques
- 🎨 **Modern UI/UX**: Clean, professional design with smooth animations
- 🧩 **Modular Architecture**: Easily extensible component system
- 🌐 **PWA Ready**: Progressive Web App capabilities

## ✨ Features

### Core Modules

- **📊 Global Dashboard**: Comprehensive overview with real-time metrics
- **🏢 Company Management**: Multi-company organization and tracking
- **📁 Project Management**: Project lifecycle and resource management
- **👥 Department Management**: Team organization and workflow management
- **📄 Document Control**: Secure document storage and version control
- **⚙️ Workflow Automation**: Custom workflow creation and management
- **🤖 AI Assistant**: Integrated AI for intelligent task assistance
- **🛠️ Settings & Configuration**: Comprehensive system configuration

### UI Features

- **Responsive Design**: Works seamlessly on phones, tablets, and desktops
- **Dark/Light Theme**: Professional light theme with modern aesthetics
- **Interactive Components**: Hover effects, animations, and smooth transitions
- **Mobile Navigation**: Bottom navigation and floating action buttons
- **Keyboard Shortcuts**: Productivity-focused keyboard navigation
- **Touch Optimized**: Touch-friendly interfaces for mobile devices

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Fonts**: Inter (UI) + Geist Mono (Code)

### Development Tools
- **Package Manager**: pnpm (recommended) or npm
- **Code Quality**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Next.js built-in Turbo

### Responsive Framework
- **Mobile First**: 320px+ support
- **Breakpoints**: xs(475px), sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px), 3xl(1920px), 4xl(2560px)
- **Grid System**: Custom responsive grid utilities
- **Components**: Fully responsive component library

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.17+ or 20.0+
- **Package Manager**: pnpm (recommended), npm, or yarn
- **Git**: Latest version

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/havenz-hub.git
   cd havenz-hub
   ```

2. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   
   # Or using yarn
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
havenz-hub/
├── app/                          # Next.js App Router
│   ├── companies/               # Company management pages
│   ├── departments/             # Department management pages
│   ├── document-control/        # Document control pages
│   ├── projects/               # Project management pages
│   ├── settings/               # Settings and configuration
│   ├── workflows/              # Workflow management pages
│   ├── z-ai/                   # AI assistant pages
│   ├── globals.css             # Global styles and CSS variables
│   ├── layout.tsx              # Root layout component
│   └── page.tsx                # Main dashboard page
├── components/                  # Reusable components
│   └── ui/                     # UI component library
│       ├── badge.tsx           # Badge component
│       ├── button.tsx          # Button component
│       ├── card.tsx            # Card component
│       ├── input.tsx           # Input component
│       ├── sidebar.tsx         # Sidebar component
│       └── ...                 # Other UI components
├── hooks/                      # Custom React hooks
│   └── use-responsive.ts       # Responsive utilities
├── lib/                        # Utility functions
│   └── utils.ts               # Common utilities
├── public/                     # Static assets
├── styles/                     # Additional stylesheets
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
└── package.json               # Dependencies and scripts
```

## 📚 Documentation

Comprehensive documentation is available for developers:

| Document | Description | Location |
|----------|-------------|----------|
| **AI Development Guide** | How to use AI assistants for development | `docs/AI_DEVELOPMENT_GUIDE.md` |
| **Frontend API Reference** | Complete API endpoints and usage | `docs/FRONTEND_API_REFERENCE.md` |
| **Backend Integration** | How to integrate with backend APIs | `docs/BACKEND_API_INTEGRATION_GUIDE.md` |
| **Permission Matrix** | Role-based access control rules | `docs/PERMISSION_MATRIX.md` |

### Quick Links

- 🤖 [**AI-Assisted Development Guide**](docs/AI_DEVELOPMENT_GUIDE.md) - Essential for developers using AI coding assistants
- 🔌 [**API Reference**](docs/FRONTEND_API_REFERENCE.md) - All API endpoints and request/response formats
- 🔐 [**Permissions**](docs/PERMISSION_MATRIX.md) - Role-based access control matrix

## 🤖 AI-Assisted Development

This project is optimized for AI-assisted development. See [`docs/AI_DEVELOPMENT_GUIDE.md`](docs/AI_DEVELOPMENT_GUIDE.md) for:

- **Common task prompts** - Ready-to-use prompts for AI assistants
- **Troubleshooting guide** - Solutions to common issues
- **Architecture overview** - How the frontend/backend work together
- **Best practices** - Patterns that work well with AI assistants

### Quick Start with AI

When working with AI assistants (Claude, GitHub Copilot, ChatGPT):

1. **Always reference working examples**: Point AI to `app/companies/page.tsx` for CRUD patterns
2. **Include documentation**: Reference `FRONTEND_API_REFERENCE.md` for API details
3. **Specify exact files**: Give file paths and line numbers for context
4. **Request incremental changes**: Break large tasks into steps

**Example Prompt:**
```
Add create functionality for departments following the pattern in
app/companies/page.tsx lines 111-171. Reference the Department CREATE
endpoint in docs/FRONTEND_API_REFERENCE.md and apply permission checks from
docs/PERMISSION_MATRIX.md (admin only).
```

See the full guide at [`docs/AI_DEVELOPMENT_GUIDE.md`](docs/AI_DEVELOPMENT_GUIDE.md).

## 📱 Responsive Design

### Breakpoint System

| Breakpoint | Size | Description |
|------------|------|-------------|
| `xs` | 475px+ | Small phones |
| `sm` | 640px+ | Large phones |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Laptops |
| `xl` | 1280px+ | Desktops |
| `2xl` | 1536px+ | Large desktops |
| `3xl` | 1920px+ | Ultra-wide monitors |
| `4xl` | 2560px+ | 4K displays |

### Responsive Features

- **Mobile Navigation**: Collapsible sidebar + bottom navigation
- **Adaptive Grids**: 1-2-3-4+ column layouts based on screen size
- **Touch Optimization**: Touch-friendly buttons and interactions
- **Typography Scaling**: Responsive text sizes across all breakpoints
- **Spacing System**: Consistent spacing that scales with screen size

### Usage Example

```tsx
// Responsive grid
<div className="grid-responsive-1-2-4 gap-4">
  {/* 1 column on mobile, 2 on tablet, 4 on desktop */}
</div>

// Responsive text
<h1 className="text-responsive-xl">
  {/* Scales from text-xl to text-4xl based on screen size */}
</h1>

// Responsive padding
<div className="padding-responsive-md">
  {/* Scales from p-4 to p-12 based on screen size */}
</div>
```

## 🧩 Components

### Core UI Components

- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Card**: Flexible container with header, content, and footer
- **Input**: Form inputs with validation states
- **Badge**: Status indicators and labels
- **Sidebar**: Collapsible navigation sidebar
- **Navigation**: Mobile-friendly navigation components

### Custom Utilities

- **Responsive Hooks**: `useBreakpoint()`, `useIsMobile()`, `useIsDesktop()`
- **Theme Utilities**: CSS custom properties for consistent theming
- **Animation Classes**: Smooth transitions and hover effects

## 🎨 Customization

### Theme Configuration

The app uses CSS custom properties for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... more variables */
}
```

### Color Scheme

- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray variants
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)

### Typography

- **Headings**: Inter font family
- **Body Text**: Inter font family
- **Code**: Geist Mono font family

## 🚀 Build & Deployment

### Build Commands

```bash
# Development
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Docker
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Static Export
```bash
# For static hosting
pnpm build && pnpm export
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Ensure responsive design on all new components
- Add proper TypeScript types
- Test on multiple screen sizes
- Follow the existing code style

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Time to Interactive**: <3s

## 🔒 Security

- **On-premise deployment** ready
- **No external dependencies** for core functionality
- **Secure by default** configuration
- **Content Security Policy** headers
- **XSS protection** built-in

## 📱 PWA Features

- **Offline capability** (coming soon)
- **Install prompt** for mobile devices
- **App-like experience** on mobile
- **Push notifications** (planned)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://radix-ui.com/) for accessible component primitives
- [Lucide](https://lucide.dev/) for beautiful icons
- [Vercel](https://vercel.com/) for hosting and deployment

## 📞 Support

For support, email [info@havenzcorp.com](mailto:info@havenzcorp.com) or join our [Discord community](https://discord.gg/havenz).

---

<div align="center">

**Built with ❤️ by the Havenz Team**

[Website](https://havenz.com) • [Documentation](https://docs.havenz.com) • [Support](mailto:support@havenz.com)

</div>