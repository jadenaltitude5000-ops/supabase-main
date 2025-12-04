#!/bin/bash
# This script forcibly removes large files from the entire Git history of your current branch.
# It is designed to fix "file size exceeds limit" errors from GitHub.

# WARNING: This rewrites your commit history. Use with caution.

echo "Step 1: Preparing a list of large files to remove..."

# List of specific files and directories to remove from all commits.
# This is more direct than finding them dynamically.
FILES_TO_REMOVE="supabase-cli .firebase/"

echo "The following file patterns will be completely removed from your history:"
echo "-----------------------------------------------------"
echo "$FILES_TO_REMOVE"
echo "-----------------------------------------------------"
read -p "Are you sure you want to continue? This is a destructive operation. [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborted by user."
    exit 1
fi

echo "Step 2: Rewriting history to remove large files..."
# This is a powerful command that goes through every commit and removes the specified files.
# Using --index-filter is faster than --tree-filter.
git filter-branch --force --index-filter \
  "git rm -r --cached --ignore-unmatch $FILES_TO_REMOVE" \
  --prune-empty --tag-name-filter cat -- --all

if [ $? -ne 0 ]; then
    echo "Error: Failed to rewrite Git history. Aborting."
    exit 1
fi

echo "Step 3: Cleaning up and reclaiming space..."
# Remove the backup refs created by filter-branch
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
# Expire all reflogs to clear old history
git reflog expire --expire=now --all
# Garbage collect to remove orphaned objects
git gc --prune=now

echo ""
echo "Repository history has been rewritten successfully."
echo "You MUST now force-push to your remote repository."
echo "Use the following command:"
echo ""
echo "git push -u origin supabase-main --force"
echo ""
echo "NOTE: A force push is required because we have rewritten the commit history."
