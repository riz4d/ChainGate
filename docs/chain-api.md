# ChainGate API Documentation

## Overview

The ChainGate API is a Django REST Framework-based backend service that provides secure access control management with blockchain integration, NFC authentication, and AI-powered analytics. It serves as the core backend for the ChainGate access control system.

## Table of Contents

- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Blockchain Integration](#blockchain-integration)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)

## Architecture

#### Technology Stack

- **Framework**: Django 5.2.1 with Django REST Framework 3.16.0
- **Database**: MongoDB (Primary) + SQLite (Development)
- **Blockchain**: Web3.py integration with Ganache/Ethereum
- **CORS**: Django CORS Headers for cross-origin requests

#### Project Structure

```
chain-api/
├── chaingate/               # Django project settings
│   ├── settings.py          # Main configuration
│   ├── urls.py              # Root URL routing
│   ├── wsgi.py              # WSGI application
│   └── asgi.py              # ASGI application
├── accesscontrol/           # Main application
│   ├── authentication/      # Authentication modules
│   ├── connections/         # Database connections
│   ├── controller/          # API controllers/views
│   ├── middleware/          # Custom middleware
│   ├── models/              # Data models
│   └── helper/              # Utility functions
├── blockchain/              # Blockchain integration
│   ├── contracts/           # Smart contract files
│   ├── modules/             # Blockchain utilities
│   └── sol/                 # Solidity contracts
├── config/                  # Configuration files
├── logs/                    # Application logs
└── requirements.txt         # Python dependencies
```

## Installation & Setup

#### Requirements

- Python 3.8+
- MongoDB 4.4+
- Node.js 16+ (for Ganache/blockchain)
- Git

#### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/riz4d/chaingate
   cd chaingate/chain-api
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Database Setup**
   ```bash
   python manage.py migrate
   ```

6. **Run Development Server**
   ```bash
   python manage.py runserver
   ```

## Configuration

#### Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
MONGODB_USER=your_username
MONGODB_PASSWORD=your_password
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/
MONGODB_DATABASE_NAME=chaingate

# Blockchain Configuration
BLOCKCHAIN_PROVIDER=http://127.0.0.1:8545
BLOCKCHAIN_ACCOUNT_INDEX=0
BLOCKCHAIN_NETWORK=testnet

# Django Configuration
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
```

#### Database Collections

The system uses the following MongoDB collections:

- `users` - User profiles and NFC card data
- `admin` - Administrator accounts
- `accesslog` - Access attempt records
- `access_levels` - Permission levels configuration
- `alertconfig` - Alert and notification settings
- `devices` - Device management and status
- `settings` - System configuration

## API Endpoints

#### Base URL
```
http://localhost:8000/api/
```

#### Access Control

##### NFC Access Verification
```http
POST /api/access/
Content-Type: application/json

{
  "uidHex": "04A1B2C3",
  "uidLength": 4,
  "gateId": "gate_001"
}
```

**Response:**
```json
{
  "message": "Access granted",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Riza",
    "access_level": "admin"
  },
  "access_granted": true,
  "timestamp": "2025-07-02T10:30:00Z",
  "blockchain_tx": "0x1234567890abcdef..."
}
```

#### User Management

##### List Users
```http
GET /api/users/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name or email
- `access_level` - Filter by access level

**Response:**
```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Riza",
      "email": "riza@example.com",
      "nfc_id": "1234567890",
      "access_level": "admin",
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total_pages": 5,
    "total_items": 50
  }
}
```

##### Create User
```http
POST /api/users/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "nfc_id": "9876543210",
  "access_level": "manager",
  "phone": "+1234567890"
}
```

##### Get User Details
```http
GET /api/users/{user_id}/
Authorization: Bearer <access_token>
```

##### Update User
```http
PUT /api/users/{user_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Jane Smith Updated",
  "access_level": "admin"
}
```

##### Delete User
```http
DELETE /api/users/{user_id}/
Authorization: Bearer <access_token>
```

#### Access Logs

##### Get Access Logs
```http
GET /api/logs/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `start_date` - Filter from date (ISO format)
- `end_date` - Filter to date (ISO format)
- `user_id` - Filter by user
- `device_id` - Filter by device
- `access_granted` - Filter by access result (true/false)

**Response:**
```json
{
  "logs": [
    {
      "id": "507f1f77bcf86cd799439011",
      "user_id": "507f1f77bcf86cd799439012",
      "device_id": "gate_001",
      "access_granted": true,
      "timestamp": "2025-07-02T10:30:00Z",
      "blockchain_tx": "0x1234567890abcdef...",
      "user_name": "Riza",
      "device_name": "Main Entrance"
    }
  ],
  "pagination": {
    "page": 1,
    "total_pages": 10,
    "total_items": 100
  }
}
```

#### Device Management

##### List Devices
```http
GET /api/devices/
Authorization: Bearer <access_token>
```

##### Register Device
```http
POST /api/devices/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Main Entrance",
  "device_id": "gate_001",
  "location": "Building A - Ground Floor",
  "type": "nfc_reader",
  "ip_address": "192.168.1.100"
}
```

##### Update Device
```http
PUT /api/devices/{device_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "active",
  "last_seen": "2025-07-02T10:30:00Z"
}
```

#### Blockchain Integration

##### Chain Information
```http
GET /api/blockchain/chain-info/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "connected": true,
  "network": "testnet",
  "block_number": 12345,
  "chain_id": 1337,
  "account": "0x1234567890abcdef...",
  "balance": "10.5 ETH",
  "contract_address": "0xabcdef1234567890...",
  "gas_price": "20 gwei"
}
```

##### Transaction History
```http
GET /api/blockchain/transactions/
Authorization: Bearer <access_token>
```

#### Access Levels

##### List Access Levels
```http
GET /api/access-levels/
Authorization: Bearer <access_token>
```

##### Create Access Level
```http
POST /api/access-levels/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "VIP",
  "description": "VIP access level",
  "permissions": ["all_areas", "24_7_access"],
  "priority": 10
}
```

#### Search & Analytics

##### Search Users
```http
GET /api/search/?query=riza
Authorization: Bearer <access_token>
```

##### User Summary/Analytics
```http
GET /api/summarize/{user_id}/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Riza",
    "total_accesses": 150,
    "last_access": "2025-07-02T10:30:00Z",
    "access_pattern": "regular",
    "most_used_device": "Main Entrance"
  },
  "analytics": {
    "daily_average": 5.2,
    "peak_hours": ["09:00", "17:00"],
    "access_success_rate": 98.5
  }
}
```

#### System Settings

##### Get Settings
```http
GET /api/settings/
Authorization: Bearer <access_token>
```

##### Update Settings
```http
PUT /api/settings/{setting_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "key": "max_daily_attempts",
  "value": "10",
  "description": "Maximum daily access attempts per user"
}
```

#### System Overview

##### Dashboard Overview
```http
GET /api/overview/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "stats": {
    "total_users": 150,
    "active_devices": 5,
    "today_accesses": 45,
    "success_rate": 98.2
  },
  "recent_accesses": [...],
  "system_health": {
    "database": "connected",
    "blockchain": "connected",
    "devices_online": 4
  }
}
```
## Security

#### Authentication Security

- **HTTP-Only Cookies**: Secure refresh token storage
- **Password Hashing**: SHA256 for admin passwords

#### API Security

- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Sanitization of all user inputs
- **SQL Injection Prevention**: Parameterized queries

#### Database Security

- **Connection Encryption**: TLS for MongoDB connections
- **Access Control**: Role-based database permissions
- **Data Validation**: Schema validation for all collections

#### Blockchain Security

- **Private Key Management**: Secure key storage
- **Transaction Verification**: Verification of blockchain transactions

## Testing

#### Unit Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test accesscontrol

```

#### API Testing

##### Using curl
```bash
# Login
curl -X POST http://localhost:8000/api/supervisor/access/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

##### Using Postman

Import the Postman collection from `tests/postman/` directory for comprehensive API testing.

#### Integration Testing

```python
from django.test import TestCase
from rest_framework.test import APIClient

class AccessControlTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
    def test_nfc_access(self):
        response = self.client.post('/api/access/', {
            'uidHex': '04A1B2C3',
            'uidLength': 4,
            'gateId': 'gate_001'
        })
        self.assertEqual(response.status_code, 200)
```

## Deployment

#### Production Setup

1. **Environment Configuration**
   ```bash
   # Production .env
   DEBUG=False
   ALLOWED_HOSTS=your-domain.com,api.your-domain.com
   SECRET_KEY=your-production-secret-key
   ```

2. **Database Configuration**
   ```bash
   # Use production MongoDB
   MONGODB_CONNECTION_STRING=mongodb://prod-server:27017/
   MONGODB_USER=prod_user
   MONGODB_PASSWORD=secure_password
   ```

3. **Static Files**
   ```bash
   python manage.py collectstatic
   ```

4. **Gunicorn Configuration**
   ```bash
   gunicorn chaingate.wsgi:application \
     --bind 0.0.0.0:8000 \
     --workers 4 \
     --timeout 120
   ```

