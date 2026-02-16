@echo off
echo Starting git operations > git_log.txt
git add . >> git_log.txt 2>&1
if %ERRORLEVEL% NEQ 0 echo git add failed >> git_log.txt && exit /b %ERRORLEVEL%

git commit -m "Initial commit" >> git_log.txt 2>&1
rem git commit might fail if nothing to commit, which is fine if we proceed, but let's log it.

git branch -M main >> git_log.txt 2>&1
if %ERRORLEVEL% NEQ 0 echo git branch failed >> git_log.txt && exit /b %ERRORLEVEL%

git push -u origin main >> git_log.txt 2>&1
if %ERRORLEVEL% NEQ 0 echo git push failed >> git_log.txt && exit /b %ERRORLEVEL%

echo All operations completed successfully >> git_log.txt
