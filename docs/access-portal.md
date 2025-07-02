# ChainGate Access Portal Documentation

## Overview

The ChainGate Access Portal is a responsive web application built with Next.js that provides a comprehensive dashboard for managing access control systems. It features real-time monitoring, user management, blockchain integration, and AI-powered analytics with a intuitive interface.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Deployment](#deployment)


## Installation & Setup

### Requirements

- Node.js 18.x or higher
- npm, yarn, or pnpm package manager
- Git for version control

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/riz4d/chaingate
   cd chaingate/access-portal
   ```

2. **Install Dependencies**
   ```bash
   # Using npm
   npm install
   
   # Using yarn
   yarn install
   
   # Using pnpm
   pnpm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open Application**
   ```
   http://localhost:3000
   ```

## Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/
```

## Deployment

### Build Process

```bash
# Production build
npm run build

# Static export (if applicable)
npm run export

# Start production server
npm start
```
