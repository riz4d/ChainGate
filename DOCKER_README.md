# ChainGate Docker Deployment Guide

This guide explains how to run the complete ChainGate system using Docker, including both the Django API and Next.js frontend in a single container, along with all required dependencies.

## Quick Start

### Prerequisites
- Docker 20.10+ 
- Docker Compose 2.0+
- At least 4GB RAM available
- Ports 80, 3000, 8000, 27017 available

### 1. Clone and Setup
```bash
git clone https://github.com/riz4d/chaingate
cd ChainGate
```

### 2. Run the Complete System
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f chaingate-app

# Check service status
docker-compose ps
```

### 3. Access the Applications

| Service | URL | Credentials |
|---------|-----|-------------|
| **ChainGate Portal** | http://localhost | -|
| **API Direct Access** | http://localhost:8000/api | - |
| **MongoDB Admin** | http://localhost:8081 | admin / admin123 |
| **Ganache RPC** | http://localhost:8545 | - |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Host                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   ChainGate     │  │    MongoDB      │  │   Ganache   │  │
│  │   Container     │  │   Database      │  │ Blockchain  │  │
│  │                 │  │                 │  │             │  │
│  │ ┌─────────────┐ │  │  ┌───────────┐  │  │ ┌─────────┐ │  │
│  │ │   Nginx     │ │  │  │   Mongo   │  │  │ │ Testnet │ │  │
│  │ │   Proxy     │ │  │  │   Data    │  │  │ │ Network │ │  │
│  │ └─────────────┘ │  │  └───────────┘  │  │ └─────────┘ │  │
│  │ ┌─────────────┐ │  └─────────────────┘  └─────────────┘  │
│  │ │   Next.js   │ │                                        │
│  │ │  Frontend   │ │                                        │
│  │ └─────────────┘ │                                        │
│  │ ┌─────────────┐ │                                        │
│  │ │   Django    │ │                                        │
│  │ │    API      │ │                                        │
│  │ └─────────────┘ │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

## Services Breakdown

### ChainGate Application Container
- **Frontend**: Next.js on port 3000
- **Backend**: Django API on port 8000  
- **Proxy**: Nginx on port 80
- **Process Manager**: Supervisor manages all processes

### External Dependencies
- **MongoDB**: Database storage (port 27017)
- **Ganache**: Blockchain testnet (port 8545)

## Configuration

### Environment Variables

The system can be configured via environment variables in `docker-compose.yml`:

#### Database Configuration
```yaml
- MONGODB_CONNECTION_STRING=mongodb://admin:admin123@mongodb:27017/chaingate?authSource=admin
- MONGODB_DATABASE_NAME=chaingate
```

#### Blockchain Configuration  
```yaml
- BLOCKCHAIN_PROVIDER=http://ganache:8545
- BLOCKCHAIN_NETWORK=testnet
```

#### Application Configuration
```yaml
- DEBUG=True
- SECRET_KEY=chaingate-secret-key-change-in-production
- NEXT_PUBLIC_API_URL=http://localhost
```

### Custom Configuration

1. **Create environment override file:**
   ```bash
   cp .env.template .env
   # Edit .env with your values
   ```

2. **Use custom environment:**
   ```yaml
   # In docker-compose.yml
   chaingate-app:
     env_file:
       - .env
   ```
