@echo off
setlocal enabledelayedexpansion

REM Configuration
set IMAGE_NAME=toolsntuts/tntchildren
set BASE_VERSION=0.0.1

REM ---- Docker Hub account selection (see xepho/docker-global.md) ----
REM Docker keys credentials by REGISTRY, and every Hub account is the same
REM registry, so there is one credential slot and logging into another
REM account evicts this one. That is the logout/login dance.
REM
REM DOCKER_CONFIG points the CLI at a per-account config directory, so each
REM account keeps its own slot. The account is DERIVED from the image
REM namespace rather than hardcoded, so this block is identical in every
REM project and cannot drift out of step with IMAGE_NAME.
for /f "tokens=1 delims=/" %%a in ("%IMAGE_NAME%") do set DOCKER_ACCOUNT=%%a
set DOCKER_CONFIG=%USERPROFILE%\.docker-accounts\%DOCKER_ACCOUNT%

REM Fail BEFORE the build, not after it. A missing credential otherwise
REM surfaces as "denied: requested access to the resource is denied" at the
REM push step, several minutes of build time after the point it was already
REM knowable.
if not exist "%DOCKER_CONFIG%\config.json" (
    echo.
    echo No Docker credential found for account "%DOCKER_ACCOUNT%".
    echo   Expected: %DOCKER_CONFIG%\config.json
    echo.
    echo   Do NOT run "docker login" - on Windows that writes to the shared
    echo   Windows Credential Manager and reintroduces the one-slot problem.
    echo   Follow section 3.2 of xepho\docker-global.md to store it instead
    echo   ^(ACCOUNT=toolsntuts, using the DOCKER_PAT_TOOLSNTUTS token^).
    echo.
    exit /b 1
)

REM Always mint a UNIQUE tag for THIS build (timestamp-suffixed). Redeploying
REM under a tag you've already pushed before (e.g. re-running with the same
REM BASE_VERSION) can let Docker/Dokploy serve a cached image instead of
REM pulling the new one, that's the "my changes never show up after
REM redeploy, it reverts" symptom. Bump BASE_VERSION by hand for a new
REM baseline whenever you like; the timestamp guarantees every push is still
REM unique regardless, so you never have to touch VERSION by hand.
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMddHHmmss"') do set TIMESTAMP=%%I
set VERSION=%BASE_VERSION%-%TIMESTAMP%

echo ============================================
echo Building and Deploying Docker Image
echo ============================================
echo Account: %DOCKER_ACCOUNT%
echo Image:   %IMAGE_NAME%
echo.

REM Step 1: Build the image
echo [1/2] Building Docker image...
docker build -t %IMAGE_NAME%:%VERSION% -t %IMAGE_NAME%:latest .

if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

echo Build successful!
echo.

REM Step 2: Push to Docker Hub
echo [2/2] Pushing to Docker Hub...
docker push %IMAGE_NAME%:%VERSION%

if errorlevel 1 (
    echo Push failed!
    echo Pushing as account "%DOCKER_ACCOUNT%" using %DOCKER_CONFIG%
    echo If this says "denied", the token may be revoked or read-only,
    echo see xepho\docker-global.md section 6.
    exit /b 1
)

docker push %IMAGE_NAME%:latest

if errorlevel 1 (
    echo Push of :latest failed! ^(the unique tag %VERSION% above still pushed fine^)
    exit /b 1
)

echo.
echo ============================================
echo Deployment Complete!
echo ============================================
echo Image: %IMAGE_NAME%:%VERSION%
echo.
echo IMPORTANT: this tag is unique to this build. In Dokploy, set the image
echo tag to %VERSION% ^(not a tag you've deployed before^) so it's forced to
echo pull this new image rather than reusing a cached one with the old tag.
echo.
echo Next steps:
echo 1. Pull the image in Dokploy: %IMAGE_NAME%:%VERSION%
echo 2. Set environment variables in Dokploy dashboard
echo 3. Deploy!
echo ============================================

endlocal
