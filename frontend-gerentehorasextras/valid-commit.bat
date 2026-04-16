@echo off

node --version | findstr /C:"v22." >nul 2>&1
if not errorlevel 1 (

  echo "Version of node is 22"
  echo "Starting validation's validations in valid-commit..."

  echo "Starting typecheck..."
  call npm run typecheck
  if errorlevel 1 (
    echo "Typecheck failed!"
    exit /b 1
  )

  echo "Starting lint..."
  call npm run lint
  if errorlevel 1 (
    echo "lint failed!"
    exit /b 1
  )

  echo "Starting package:check..."
  call npm run package:check
  if errorlevel 1 (
    echo "package:check failed!"
    exit /b 1
  )

  echo "All validations in valid-commit.bat passed!"

) else (
  echo "Version of node is not 22"
  exit /b 1  
)
