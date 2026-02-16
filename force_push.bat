@echo off
echo Configuring git...
git config user.email "you@example.com"
git config user.name "Your Name"

echo Adding files...
git add .

echo Committing changes...
git commit -m "Update code"

echo Renaming branch to main...
git branch -M main

echo Pushing to GitHub (Force)...
git push -f origin main

echo Done.
pause
