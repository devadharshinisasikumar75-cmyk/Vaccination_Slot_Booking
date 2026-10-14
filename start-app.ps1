param(
    [ValidateSet("all", "backend", "frontend")]
    [string]$Mode = "all"
)

$frontendDir = Join-Path $PSScriptRoot "Vaccination_frontend"
$backendDir = Join-Path $PSScriptRoot "Vaccination_backend"

if ($Mode -ne "frontend" -and -not (Get-Command java -ErrorAction SilentlyContinue)) {
    throw "Java was not found on PATH. Install JDK 21 and reopen VS Code."
}

if ($Mode -ne "backend" -and -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm was not found on PATH. Install Node.js and reopen VS Code."
}

if ($Mode -eq "frontend") {
    $requiredDirectories = @($frontendDir)
}
elseif ($Mode -eq "backend") {
    $requiredDirectories = @($backendDir)
}
else {
    $requiredDirectories = @($frontendDir, $backendDir)
}

foreach ($directory in $requiredDirectories) {
    if (-not (Test-Path $directory)) {
        throw "Project folder not found: $directory"
    }
}

if ($Mode -ne "frontend" -and -not (Test-Path (Join-Path $backendDir "mvnw.cmd"))) {
    throw "Maven wrapper not found in $backendDir"
}

function Import-BackendEnvironment {
    $environmentFile = Join-Path $backendDir ".env"

    if (-not (Test-Path $environmentFile)) {
        Copy-Item (Join-Path $backendDir ".env.example") $environmentFile
        Write-Host "Created $environmentFile from .env.example."
    }

    $environmentLines = @(Get-Content -LiteralPath $environmentFile)
    foreach ($secretName in @("OTP_HMAC_SECRET", "JWT_SECRET")) {
        $secretLine = $environmentLines | Where-Object {
            $_ -match "^\s*$secretName\s*=\s*(.*?)\s*$"
        } | Select-Object -First 1
        $secretValue = ""
        if ($secretLine -and $secretLine -match "^\s*$secretName\s*=\s*(.*?)\s*$") {
            $secretValue = $matches[1].Trim("'`"")
        }

        if ([string]::IsNullOrWhiteSpace($secretValue)) {
            $secretBytes = New-Object byte[] 32
            $randomGenerator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
            try {
                $randomGenerator.GetBytes($secretBytes)
            }
            finally {
                $randomGenerator.Dispose()
            }
            $secretValue = [Convert]::ToBase64String($secretBytes)
            $secretEntry = "$secretName=$secretValue"
            $existingIndex = -1
            for ($index = 0; $index -lt $environmentLines.Count; $index++) {
                if ($environmentLines[$index] -match "^\s*$secretName\s*=") {
                    $existingIndex = $index
                    break
                }
            }
            if ($existingIndex -ge 0) {
                $environmentLines[$existingIndex] = $secretEntry
            }
            else {
                $environmentLines += $secretEntry
            }
            Set-Content -LiteralPath $environmentFile -Value $environmentLines -Encoding ASCII
        }
    }

    foreach ($line in Get-Content -LiteralPath $environmentFile) {
        if ($line -match '^\s*(#.*)?$') { continue }
        if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
            $name = $matches[1]
            $value = $matches[2]

            if ($value.Length -ge 2) {
                $first = $value.Substring(0, 1)
                $last = $value.Substring($value.Length - 1, 1)
                if (($first -eq '"' -and $last -eq '"') -or
                    ($first -eq "'" -and $last -eq "'")) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
            }

            if (-not [string]::IsNullOrWhiteSpace($value)) {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
}

if ($Mode -ne "frontend") {
    Import-BackendEnvironment

    $requiredEnvironmentVariables = @(
        "BREVO_API_KEY",
        "BREVO_SENDER_EMAIL",
        "OTP_HMAC_SECRET",
        "JWT_SECRET"
    )
    $missingVariables = @($requiredEnvironmentVariables | Where-Object {
        [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_))
    })

    if ($missingVariables.Count -gt 0) {
        throw "Set these values in $backendDir\.env: $($missingVariables -join ', ')"
    }
}

function Start-Frontend {
    Set-Location $frontendDir

    if (-not (Test-Path (Join-Path $frontendDir "node_modules\.bin\vite.cmd"))) {
        Write-Host "Installing frontend dependencies..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Frontend dependency installation failed."
        }
    }

    Write-Host "Starting frontend at http://localhost:5173 ..."
    npm run dev -- --host 0.0.0.0 --open
    exit $LASTEXITCODE
}

if ($Mode -eq "backend") {
    Set-Location $backendDir
    .\mvnw.cmd spring-boot:run
    exit $LASTEXITCODE
}

if ($Mode -eq "frontend") {
    Start-Frontend
}

if ($Mode -eq "all") {
    $powershell = Join-Path $env:WINDIR "System32\WindowsPowerShell\v1.0\powershell.exe"
    $launcherPath = "`"$PSCommandPath`""
    $arguments = @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-File", $launcherPath,
        "-Mode", "backend"
    )

    Write-Host "Starting Spring Boot backend in a separate PowerShell window..."
    Start-Process -FilePath $powershell `
        -ArgumentList $arguments `
        -WorkingDirectory $backendDir

    Start-Frontend
}
