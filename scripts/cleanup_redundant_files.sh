#!/bin/bash

# Cleanup redundant or development-only files
set -e

# Remove .new files in app/exclusive/[slug]
echo "Removing .new files in app/exclusive/[slug]..."
rm -f app/exclusive/[slug]/ImageSetContent.tsx.new || true
rm -f app/exclusive/[slug]/page.tsx.new || true

echo "Removing test/example pages..."
rm -rf app/test || true
rm -rf app/test-upload || true
rm -rf app/auth/test || true
rm -rf app/clear-gallery || true

echo "Removing gallery2 directory (if not needed)..."
rm -rf app/gallery2 || true

echo "Removing Supabase temp/branches files..."
rm -f supabase/.temp/cli-latest || true
rm -f supabase/.branches/_current_branch || true

echo "Redundant files cleanup complete." 