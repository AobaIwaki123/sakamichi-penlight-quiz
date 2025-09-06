# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Frontend (in `view/` directory):**
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

**Docker & Deployment:**
- `make build` - Build Docker image for production
- `make run` - Run Docker container locally
- `make cd` - Build, tag, and push to registry
- `make sync` - Trigger ArgoCD sync for deployment

## Architecture Overview

This is a Next.js quiz application about Sakamichi Group idol penlight colors, structured as follows:

### Core Structure
- **Frontend**: Next.js 15 app in `view/` directory using App Router
- **State Management**: Zustand stores for application state
- **UI Framework**: Mantine UI components with custom theme
- **Data Source**: BigQuery API for member information
- **Deployment**: Kubernetes with ArgoCD GitOps workflow

### Key Directories
- `view/app/` - Next.js App Router pages and layouts
- `view/components/` - React components organized by feature
- `view/stores/` - Zustand state management stores
- `view/api/` - API functions for data fetching
- `view/types/` - TypeScript type definitions
- `view/consts/` - Application constants and filters
- `k8s/` - Kubernetes deployment manifests

### Application Flow
1. **Member Selection**: `useSelectedMemberStore` manages member data, filtering, and random selection
2. **Quiz Logic**: Users guess penlight colors for randomly selected idol members
3. **State Management**: Multiple Zustand stores handle different aspects (answers, filters, UI triggers)
4. **Data Fetching**: BigQuery integration provides member information and penlight colors

### Testing
- Jest with React Testing Library
- Tests located in `view/__tests__/`
- Setup file: `view/jest.setup.js`
- Configuration: `view/jest.config.js`

### Key Components
- `Home` - Main quiz interface with member info and penlight form
- `MemberInfo` - Displays current member information
- `PenlightForm` - Quiz interaction interface
- Various stores manage quiz state, member selection, and UI interactions

## Development Workflow
- **Before making changes**: Create a new feature branch from main (e.g., `git checkout -b feature/description`)
- **After making changes**: Always commit and push changes, then create a PR if one doesn't exist
- Use descriptive commit messages that explain the purpose of the change
- **Create pull requests**: Include code review before merging to main and add appropriate version labels:
  - `major` - Breaking changes or major new features
  - `minor` - New features or enhancements
  - `patch` - Bug fixes, documentation, or small improvements

## Important Notes
- Application is optimized for mobile/portrait orientation
- Uses PWA features with manifest and service worker
- BigQuery integration requires proper authentication
- Docker deployment targets production environment