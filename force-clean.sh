#!/bin/bash
# This script forcibly removes large files from the Git cache and creates a new commit.
# It is designed to fix "file size exceeds limit" errors from GitHub.

echo "Step 1: Removing all cached files from Git index..."
git rm -r --cached .
if [ $? -ne 0 ]; then
    echo "Error: Failed to remove cached files. Aborting."
    exit 1
fi

echo "Step 2: Re-adding all valid files to the index..."
git add .
if [ $? -ne 0 ]; then
    echo "Error: Failed to re-add files. Aborting."
    exit 1
fi

echo "Step 3: Committing the clean state..."
# The --amend flag is used to modify the very last commit.
# If you have made other commits after the initial one, you might need a more complex 'git rebase'
# but for this specific scenario, amending the last commit is the cleanest approach.
git commit --amend -m "Initial commit: Supabase migration project base (Cleaned)"
if [ $? -ne 0 ]; then
    echo "Error: Failed to commit changes. Aborting."
    exit 1
fi

echo ""
echo "Repository has been cleaned."
echo "You can now push to your remote repository with the following command:"
echo "git push -u origin supabase-main --force"
echo ""
echo "NOTE: A force push is required because we have amended the commit history."
