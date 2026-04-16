@echo off

node --version | findstr /C:"v22." >nul 2>&1
if not errorlevel 1 (

  echo "Version of node is 22"
  echo Starting validation's validations in valid...

  echo "Starting build..."
  call npm run build
  if errorlevel 1 (
      echo "build failed!"
      exit /b 1
  )

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

  echo "All validations in valid.bat passed!"

) else (
  echo "Version of node is not 22"
  exit /b 1  
)

@REM NOTES

@REM call files:
@REM call file.bat
