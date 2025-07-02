# ChainGate API Testing with Postman

This directory contains Postman collection and environment files for testing the ChainGate access control API.

## Files

- `ChainGate_API_Collection.json` - Complete Postman collection with all API endpoints
- `ChainGate_Development_Environment.json` - Environment variables for development setup
- `README.md` - This documentation file

## Setup Instructions

### 1. Import Collection and Environment

1. Open Postman
2. Click "Import" button
3. Import both JSON files:
   - `ChainGate_API_Collection.json`
   - `ChainGate_Development_Environment.json`
4. Select "ChainGate Development Environment" from the environment dropdown

### 2. Configure Environment Variables

Update the following variables in your environment:

- `base_url`: Your ChainGate API server URL (default: http://localhost:8000)
- `admin_email`: Administrator email for authentication
- `admin_password`: Administrator password
- `test_nfc_id`: Sample NFC ID for testing access control
- `test_gate_id`: Sample gate ID for testing

### 3. Start ChainGate API Server

Make sure your ChainGate API server is running:

```bash
cd chain-api
python manage.py runserver
```

## API Endpoints Overview

### Authentication

- **POST** `/api/supervisor/access/` - Admin login
- **POST** `/api/supervisor/refresh-token/` - Refresh authentication token
- **POST** `/api/supervisor/logout/` - Admin logout

### Access Control

- **POST** `/api/access/` - Process NFC card access (core functionality)

### User Management

- **GET** `/api/users/` - List users with pagination and filtering
- **POST** `/api/users/` - Create new user
- **DELETE** `/api/users/{user_id}/` - Delete user

### Device Management

- **GET** `/api/devices/` - List all devices
- **POST** `/api/devices/` - Register new device
- **PUT** `/api/devices/{device_id}/` - Update device

### Access Logs

- **GET** `/api/logs/` - Retrieve access logs with filtering

### Access Levels

- **GET** `/api/access-levels/` - List access levels
- **GET** `/api/access-levels/{level_id}/` - Get specific access level
- **POST** `/api/access-levels/` - Create access level

### Blockchain

- **GET** `/api/blockchain/chain-info/` - Blockchain status and info
- **GET** `/api/blockchain/transactions/` - List blockchain transactions

### Settings & Configuration

- **GET** `/api/settings/` - Get system settings
- **PUT** `/api/settings/` - Update system settings
- **GET** `/api/alert-config/` - Get alert configuration
- **PUT** `/api/alert-config/{config_id}/` - Update alert config

### Dashboard & Analytics

- **GET** `/api/overview/` - Dashboard overview with statistics

### Search & Reporting

- **GET** `/api/search/` - Search users
- **GET** `/api/search/{user_id}/` - Search specific user
- **GET** `/api/summarize/` - User summary statistics
- **GET** `/api/summarize/{user_id}/` - Specific user summary

## Testing Workflow

### 1. Authentication Flow

1. Run "Admin Login" request
2. Verify successful login response
3. Session will be maintained for subsequent requests

### 2. Basic Access Control Test

1. Ensure you're authenticated
2. Run "NFC Access Check" with sample data:
   ```json
   {
     "uidHex": "04:5B:8C:A2",
     "uidLength": 4,
     "gateId": "GATE001"
   }
   ```

### 3. User Management Flow

1. Run "Get All Users" to see existing users
2. Run "Create New User" to add a test user
3. Run "Get All Users" again to verify creation
4. Run "Delete User" to clean up

### 4. Device Management Flow

1. Run "Get All Devices" to see current devices
2. Run "Create New Device" to register a new gate
3. Run "Update Device" to modify device settings

### 5. System Monitoring

1. Run "Get Overview Dashboard" for system statistics
2. Run "Get Access Logs" to view recent activity
3. Run "Get Chain Info" to check blockchain connectivity

## Request Examples

### NFC Access Control

```json
{
  "uidHex": "04:5B:8C:A2",
  "uidLength": 4,
  "gateId": "GATE001"
}
```

### Create User

```json
{
  "name": "Riza",
  "email": "riza@example.com",
  "nfc_id": "1234567890",
  "access_level": "Admin",
  "active": true,
  "position": "Security Engineer"
}
```

### Create Device

```json
{
  "tag_id": "GATE001",
  "name": "Main Entrance Gate",
  "location": "Building A - Front Door",
  "status": "Active",
  "total_scans": 0,
  "assigned_to": ["Admin", "employee"]
}
```

## Response Examples

### Successful Access

```json
{
  "message": "Access granted to Riza",
  "original_uid": "04:5B:8C:A2",
  "processed_uid": "A2:8C:5B:04",
  "decimal_value": "1234567890",
  "user_found": true,
  "user": {
    "_id": "user_id",
    "name": "Riza",
    "access_level": "Admin"
  },
  "blockchain_tx": "0x1234...abcd"
}
```

### Dashboard Overview

```json
{
  "total_devices": 5,
  "active_devices": 4,
  "total_visitors": 150,
  "successful_verifications": 1420,
  "denied_verifications": 25,
  "success_rate": 98.3,
  "blockchain_connected": true,
  "blockchain_latency": 45.2,
  "recent_logs": [...]
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Testing Tips

1. **Authentication**: Always authenticate first before testing protected endpoints
2. **Session Management**: The Django session system maintains authentication state
3. **Data Validation**: Test with both valid and invalid data to verify error handling
4. **Pagination**: Use `page` and `per_page` parameters for large datasets
5. **Filtering**: Utilize query parameters for filtering results
6. **Blockchain**: Ensure your local blockchain node is running for blockchain-related tests

## Automation Scripts

The collection includes pre-request and test scripts for:

- Automatic environment variable setup
- Response time validation
- Status code verification
- JSON format validation

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure ChainGate API server is running
2. **Authentication Errors**: Verify admin credentials in environment
3. **Blockchain Errors**: Check if local blockchain node is running
4. **Database Errors**: Ensure MongoDB is running and accessible

### Debug Mode

Enable Django debug mode for detailed error messages:

```python
# settings.py
DEBUG = True
```

## Security Notes

- Never commit real credentials to version control
- Use environment variables for sensitive data
- Test with non-production data
- Regularly rotate test credentials
