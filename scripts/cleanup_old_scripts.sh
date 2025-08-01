#!/bin/bash

# Cleanup script for old one-time fix scripts
# These scripts are no longer needed as they've been incorporated into proper migrations

echo "🧹 Cleaning up old one-time fix scripts..."

# List of scripts to delete (these were one-time fixes)
scripts_to_delete=(
    "fix-admin-profile.js"
    "fix-custom-pages-schema.sql"
    "restore-rich-content.js"
    "fix-custom-pages-schema.js"
    "check-current-schema.js"
    "final-complete-restore.js"
    "comprehensive-restoration.js"
    "ultra-minimal-restore.js"
    "final-restoration.js"
    "fix-remaining-schema.js"
    "restore-content-fixed.js"
    "restore-all-content.js"
    "run-final-rls-fix.sql"
    "fix-comments-rls-final.sql"
    "fix-auth-issues.sql"
    "check-profiles-and-auth.sql"
    "check-comments-rls-fixed.sql"
    "fix-comments-complete.sql"
    "check-comments-rls.sql"
    "fix-comments-rls.sql"
    "setup-comments.sql"
    "inspect-homepage-db.ts"
    "check-homepage-db.ts"
    "check-homepage.ts"
    "check-admin-user.js"
    "check-gallery-setup.js"
    "fix-admin-user.js"
    "reset-admin-password.js"
    "reset-password-admin.js"
    "update-admin-email.js"
    "create-admin-user.js"
    "check-admin-user-email.js"
    "check-admin-email.js"
    "check-contact-page.js"
    "init-homepage-data.js"
    "setup-gallery-sections.js"
    "setup-gallery-policies.sql"
    "clean-uploads.js"
)

# Delete each script
for script in "${scripts_to_delete[@]}"; do
    if [ -f "$script" ]; then
        echo "🗑️  Deleting $script"
        rm "$script"
    else
        echo "⚠️  $script not found (already deleted?)"
    fi
done

echo "✅ Cleanup complete!"
echo ""
echo "📁 Remaining essential files:"
echo "   - backup.sh (keep for backups)"
echo "   - All files in supabase/migrations/ (keep - these are your schema)"
echo ""
echo "🎯 Next step: Create comprehensive setup script"

# ---
# Clean and Rebuild Next.js Project
# Usage: bash scripts/cleanup_old_scripts.sh clean-and-rebuild
if [[ "$1" == "clean-and-rebuild" ]]; then
  echo "Cleaning .next, node_modules/.cache, and out directories..."
  rm -rf .next node_modules/.cache out
  echo "Installing dependencies..."
  npm install
  echo "Rebuilding Next.js project..."
  npm run build
  echo "Done."
  exit 0
fi 