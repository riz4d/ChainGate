# ChainGate Database

## Backup Information

This directory contains a MongoDB database backup for the ChainGate access control system. The backup was created using `mongodump` and contains all collections from the production database.

### Backup Details

- **Database Name**: `chaingate`
- **Backup Format**: MongoDB BSON + Metadata JSON
- **Collections**: 7 core collections
- **Backup Date**: July 2025
- **MongoDB Version**: 7.0+ compatible

## Collections Overview

### Core Collections Included

| Collection        | Purpose           | Contains                              |
| ----------------- | ----------------- | ------------------------------------- |
| `users`         | User Management   | System users, employees, visitors     |
| `admin`         | Admin Accounts    | Administrative user accounts          |
| `accesslog`     | Access Tracking   | All access attempts and verifications |
| `devices`       | Device Management | NFC readers, gates, controllers       |
| `access_levels` | Permission System | Access level definitions and rules    |
| `settings`      | System Config     | Application configuration settings    |
| `alertconfig`   | Alert System      | Notification and alert configurations |

### Missing Collections (Expected)

- `cards` - NFC card/tag associations (not present in this backup)

## File Structure

```
database/chaingate/
├── users.bson                 # User data (binary)
├── users.metadata.json        # Collection metadata
├── admin.bson                 # Admin accounts (binary)
├── admin.metadata.json        # Collection metadata
├── accesslog.bson            # Access logs (binary)
├── accesslog.metadata.json   # Collection metadata
├── devices.bson              # Device information (binary)
├── devices.metadata.json     # Collection metadata
├── access_levels.bson        # Permission levels (binary)
├── access_levels.metadata.json # Collection metadata
├── settings.bson             # System settings (binary)
├── settings.metadata.json    # Collection metadata
├── alertconfig.bson          # Alert configurations (binary)
└── alertconfig.metadata.json # Collection metadata
```

## Database Schema Analysis

### Index Information

All collections have the standard MongoDB ObjectId index:

- **Index Type**: Single field ascending
- **Index Name**: `_id_`
- **Version**: 2 (modern MongoDB format)

### Collection UUIDs

Each collection has a unique identifier for tracking:

- `users`: `b662dbbee22b40eea3dc02e1d1ea589b`
- `admin`: `829ff9854462496cb813cf467e97bb59`
- `accesslog`: `a7aa6389959340fe9d6109309ba01387`
- `devices`: `34b832a4ccea4f8e82c30e80c3db5ec1`
- `access_levels`: `c82c689637e94b43baecbe78cd49020a`
- `settings`: `06638873ee2d46d0bcf4b433b55518ae`
- `alertconfig`: `1f3e4b43e0f04892acc1b1ae4fbf0709`

## Expected Data Structure

### Users Collection

Likely contains:

- User profiles and contact information
- Department and position details
- Access level assignments
- Account status and timestamps

### Admin Collection

Administrative accounts with:

- Admin credentials and roles
- Permission levels
- Session management data
- Last login information

### Access Log Collection

Access attempt records:

- NFC scan events
- Gate access logs
- Verification results
- Timestamp and location data

### Devices Collection

Physical hardware information:

- NFC readers and scanners
- Gate controllers
- Device status and health
- Network configuration

### Access Levels Collection

Permission definitions:

- Security clearance levels
- Area access permissions
- Time-based restrictions
- Special privileges

### Settings Collection

System configuration:

- Application settings
- Security parameters
- Feature toggles
- Integration configs

### Alert Config Collection

Notification system:

- Alert rule definitions
- Notification channels
- Escalation procedures
- Message templates

## Restore Instructions

### Prerequisites

- MongoDB installed (version 7.0+ recommended)
- `mongorestore` utility available
- Access to target MongoDB instance

### Basic Restore Command

```bash
# Restore to local MongoDB instance
mongorestore --db chaingate /path/to/database/chaingate/

# Restore to MongoDB Atlas (cloud)
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/" --db chaingate /path/to/database/chaingate/

# Restore to different database name
mongorestore --db chaingate_restored /path/to/database/chaingate/
```

### Advanced Restore Options

```bash
# Restore specific collection only
mongorestore --db chaingate --collection users /path/to/database/chaingate/users.bson

# Restore with index rebuild
mongorestore --db chaingate --restoreIndexes /path/to/database/chaingate/

# Restore without overwriting existing data
mongorestore --db chaingate --noOverwrite /path/to/database/chaingate/
```

## Data Analysis Commands

### Quick Data Inspection

```bash
# Count documents in each collection
mongo chaingate --eval "
  db.getCollectionNames().forEach(function(collection) {
    print(collection + ': ' + db.getCollection(collection).count())
  })
"

# Check collection sizes
mongo chaingate --eval "db.stats()"

# Sample documents from users collection
mongo chaingate --eval "db.users.findOne()"
```

### Validation Commands

```bash
# Validate collection integrity
mongo chaingate --eval "db.users.validate()"

# Check indexes
mongo chaingate --eval "db.users.getIndexes()"

# Database statistics
mongo chaingate --eval "db.runCommand({dbStats: 1})"
```

## Backup Information

### Creating New Backups

```bash
# Create full database backup
mongodump --uri "mongodb+srv://..." --db chaingate --out backup/

# Create compressed backup
mongodump --uri "mongodb+srv://..." --db chaingate --gzip --out backup/

# Backup specific collections
mongodump --uri "mongodb+srv://..." --db chaingate --collection users --out backup/
```

### Backup Best Practices

- **Frequency**: Daily automated backups recommended
- **Retention**: Keep 30 days of backups minimum
- **Testing**: Regularly test restore procedures
- **Monitoring**: Verify backup completion and integrity

### Troubleshooting

- Check MongoDB logs for restore issues
- Verify network connectivity for Atlas restores
- Ensure sufficient disk space for restore
- Validate user permissions for database operations

## Support Information

### Documentation References

- [MongoDB Restore Documentation](https://docs.mongodb.com/database-tools/mongorestore/)
- [ChainGate API Documentation](../chain-api/README.md)
- [Frontend Application](../access-portal/README.md)

---

**Last Updated**: July 2025
**Backup Version**: Production Snapshot
**Database Version**: MongoDB 7.0+
