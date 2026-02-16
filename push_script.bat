@echo off
echo Committing changes...
git commit -m "Initial commit"

echo Renaming branch to main...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo Done.
pause
