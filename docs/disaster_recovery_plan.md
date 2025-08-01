# Disaster Recovery Plan

## Overview

This document outlines the steps to recover the database and application in case of a disaster. It includes backup procedures, recovery steps, and testing recommendations.

## Backup Strategy

### Database Backups

- **Backup Script:** Use the `backup.sh` script located in the `scripts` directory to create regular backups of the Supabase database.
- **Backup Frequency:** Run the backup script daily or as needed.
- **Backup Location:** Store backups in the `./backups` directory. Consider using a cloud storage service (e.g., S3, Google Cloud Storage) for additional security.

### Backup Script Usage

1. Navigate to the project root directory.
2. Run the backup script:
   ```bash
   ./scripts/backup.sh
   ```
3. Verify the backup file is created in the `./backups` directory.

## Recovery Process

### Restore Database

1. **Locate the Latest Backup:** Identify the most recent backup file in the `./backups` directory.
2. **Restore the Database:**
   ```bash
   pg_restore -h your_database_host -U your_database_user -d your_database_name -f ./backups/backup_YYYYMMDD_HHMMSS.sql
   ```
3. **Verify Restoration:** Check the database to ensure all tables and data are restored correctly.

### Run Migrations

1. **Apply Migrations:** Run the migration scripts to ensure the database schema is up-to-date:
   ```bash
   npx supabase db reset
   ```
2. **Verify Migrations:** Check the database to ensure all migrations are applied successfully.

## Testing

- **Disaster Recovery Drill:** Periodically test the recovery process in a staging environment to ensure it works as expected.
- **Automated Testing:** Consider adding automated tests for your migrations to catch issues early.

## Documentation

- **Environment Variables:** Ensure all sensitive configuration (e.g., Cloudinary API keys) is documented and stored securely.
- **Recovery Plan:** Keep this document updated with any changes to the backup or recovery process.

## Contact Information

- **Database Administrator:** [Name and Contact Information]
- **Application Developer:** [Name and Contact Information]

---

This plan should be reviewed and updated regularly to ensure it remains effective and aligned with the current infrastructure and requirements. 