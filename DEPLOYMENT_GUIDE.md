# 🚀 DEPLOYMENT GUIDE - Project Attachments System

## Pre-Deployment Checklist

Before deploying to production, ensure:

```
✅ Backups
  □ Database backed up
  □ Storage backed up
  □ Config files secured

✅ Environment
  □ Server meets requirements
  □ Storage directory writable
  □ Disk space available (min 1GB)
  □ PHP 8.0+ installed
  □ MySQL/MariaDB running

✅ Code Review
  □ All changes reviewed
  □ No syntax errors
  □ No security issues
  □ Documentation complete
```

---

## Step-by-Step Deployment

### STEP 1: Pull Latest Code
```bash
cd /path/to/sohojsync
git pull origin main
# or if using other version control
```

### STEP 2: Install/Update Dependencies
```bash
# Backend dependencies
composer install --no-dev

# Frontend dependencies (if needed)
cd frontend && npm install && cd ..
```

### STEP 3: Run Database Migration
```bash
php artisan migrate
```

**Output should show:**
```
Running migrations.
  2024_12_12_000000_create_project_attachments_table ... DONE
```

### STEP 4: Create Storage Symlink
```bash
php artisan storage:link
```

**Output should show:**
```
The [public/storage] directory has been linked.
```

### STEP 5: Set Permissions
```bash
# Storage directory
chmod -R 755 storage
chmod -R 755 bootstrap/cache

# Optional: More restrictive permissions
sudo chown -R www-data:www-data storage bootstrap/cache
```

### STEP 6: Clear Caches
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
```

### STEP 7: Verify Installation
```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getPdo()

# Should return connection object (type: exit to close)
exit
```

### STEP 8: Build Frontend (if needed)
```bash
cd frontend
npm run build
cd ..
```

---

## Post-Deployment Verification

### Test File Upload
1. Navigate to `http://your-domain/projects`
2. Click "New Project"
3. Fill in project details
4. Scroll to "Project Attachments"
5. Upload test file
6. Submit form
7. Verify file upload completes

### Test Project Details
1. Click on created project
2. Click "View Details" button
3. Verify project information displays
4. Verify progress bars show
5. Verify tasks list displays
6. Verify team members show

### Check Server Logs
```bash
# View recent errors
tail -f storage/logs/laravel.log

# Check for any upload errors
grep -i "upload\|file\|attachment" storage/logs/laravel.log
```

---

## Rollback Procedure (If Needed)

### Quick Rollback
```bash
# Revert migration
php artisan migrate:rollback

# Git rollback
git revert HEAD
```

### Full Rollback
```bash
# Stop application
# Restore from backup
# Clear cache
php artisan cache:clear

# Restart services
```

---

## Monitoring Post-Deployment

### Daily Checks
```bash
# Monitor error log
tail -20 storage/logs/laravel.log

# Check disk usage
df -h storage/

# Monitor file uploads
ls -lh storage/app/public/project-attachments/
```

### Weekly Checks
1. Review error logs for patterns
2. Monitor disk space growth
3. Check database size
4. Verify backups completed
5. Test file download/access

### Monthly Maintenance
1. Optimize database tables
2. Archive old files
3. Update dependencies
4. Security audit
5. Performance review

---

## Troubleshooting Guide

### Issue: Migration Failed
**Solution:**
```bash
# Check migration status
php artisan migrate:status

# If stuck, rollback and retry
php artisan migrate:rollback
php artisan migrate
```

### Issue: Storage Link Error
**Solution:**
```bash
# Remove existing symlink
rm public/storage

# Create new symlink
php artisan storage:link
```

### Issue: Permission Denied on Upload
**Solution:**
```bash
# Check directory permissions
ls -la storage/app/public/

# Fix permissions
sudo chown -R www-data:www-data storage/
chmod -R 755 storage/
```

### Issue: File Upload Fails
**Solution:**
```bash
# Verify storage directory exists
ls -la storage/app/public/project-attachments/

# Create if missing
mkdir -p storage/app/public/project-attachments

# Check permissions
chmod -R 755 storage/app/public/project-attachments/
```

### Issue: Database Connection Error
**Solution:**
```bash
# Test connection
php artisan tinker
>>> DB::connection()->getPdo()
exit

# Check .env file
cat .env | grep DB_

# Verify MySQL is running
mysql -u username -p -e "SELECT 1"
```

---

## Configuration Checklist

### Laravel Configuration
- [ ] .env file configured
- [ ] APP_ENV set correctly
- [ ] APP_DEBUG=false for production
- [ ] DB credentials correct
- [ ] FILESYSTEM_DISK=public
- [ ] MAIL_* configured if needed

### Web Server Configuration
- [ ] Document root points to public/
- [ ] Rewrite rules configured
- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] Compression enabled
- [ ] Cache headers set

### File System Configuration
- [ ] Storage directory writable
- [ ] Uploads directory writable
- [ ] Logs directory writable
- [ ] Cache directory writable
- [ ] Disk space > 1GB available
- [ ] Backup strategy in place

---

## Performance Optimization

### Database Optimization
```bash
# Optimize tables
php artisan db:optimize

# Clear old sessions
php artisan session:table && php artisan migrate
```

### Cache Configuration
```bash
# Use Redis if available (faster)
CACHE_DRIVER=redis

# Or use database caching
CACHE_DRIVER=database
```

### File Cleanup (Monthly)
```bash
# Remove old files (adjust date as needed)
find storage/app/public/project-attachments -type f -mtime +90 -delete

# Or archive old files
tar -czf archive-$(date +%Y%m%d).tar.gz storage/app/public/project-attachments/
```

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] Firewall configured
- [ ] Database backed up
- [ ] Storage backed up
- [ ] File permissions correct
- [ ] .env file protected
- [ ] API keys stored securely
- [ ] Regular security updates
- [ ] Monitoring active

---

## Health Check Script

Create `health-check.sh`:
```bash
#!/bin/bash

echo "=== Health Check ==="

# Check database connection
php artisan tinker -q <<'EOF'
try {
    DB::connection()->getPdo();
    echo "✓ Database: OK\n";
} catch (\Exception $e) {
    echo "✗ Database: FAILED\n";
}
EOF

# Check storage
if [ -w "storage/" ]; then
    echo "✓ Storage: Writable"
else
    echo "✗ Storage: Not writable"
fi

# Check disk space
df -h storage/ | tail -1

# Check error log
ERRORS=$(grep -c "ERROR" storage/logs/laravel.log 2>/dev/null || echo 0)
echo "Recent Errors: $ERRORS"

echo "=== End Check ==="
```

Run with:
```bash
chmod +x health-check.sh
./health-check.sh
```

---

## Emergency Support

### Emergency Contacts
- Development Team: devteam@sohojsync.com
- System Admin: admin@sohojsync.com
- On-Call Support: +1-XXX-XXX-XXXX

### Emergency Procedures
1. **Service Down:** Stop users, assess issue, restore from backup
2. **Data Loss:** Restore from backup, verify integrity
3. **Security Breach:** Isolate system, check logs, restore if needed

---

## Documentation References

For more information, see:
- `QUICK_START_ATTACHMENTS.md` - User guide
- `PROJECT_ATTACHMENTS_IMPLEMENTATION.md` - Technical details
- `COMPLETE_SUMMARY.md` - Full overview
- `IMPLEMENTATION_CHECKLIST.md` - Implementation details

---

## Sign-Off

Deployment completed on: ________________
Deployed by: ________________
Verified by: ________________
Approval: ________________

---

**Total Deployment Time:** ~15 minutes
**Estimated Downtime:** 2-5 minutes (for cache clearing)
**Post-Deployment Verification Time:** ~5 minutes

**Good luck with deployment!** 🚀

---

*Last Updated: December 12, 2025*
