# PowerShell script to compile the Circom circuit and generate keys
# This needs circom and snarkjs installed globally

$ErrorActionPreference = "Stop"

# Ensure cargo/circom is in PATH
$env:Path += ";$env:USERPROFILE\.cargo\bin"

$CIRCUIT_NAME = "auth"
$CIRCUIT_DIR = "circuits"
$BUILD_DIR = "circuits/build"
$PTAU_FILE = "powersOfTau28_hez_final_12.ptau"

Write-Host "Setting up circuit compilation..." -ForegroundColor Cyan

# Create build directory
New-Item -ItemType Directory -Force -Path $BUILD_DIR | Out-Null

# Download Powers of Tau if not exists
$ptauPath = Join-Path $BUILD_DIR $PTAU_FILE
if (-not (Test-Path $ptauPath)) {
    Write-Host "Downloading Powers of Tau file..." -ForegroundColor Yellow
    try {
        # Try primary source
        Invoke-WebRequest -Uri "https://storage.googleapis.com/zkevm/ptau/$PTAU_FILE" -OutFile $ptauPath -UserAgent "Mozilla/5.0"
    } catch {
        Write-Host "Primary source failed, trying alternative..." -ForegroundColor Yellow
        # Try alternative source
        Invoke-WebRequest -Uri "https://hermez.s3-eu-west-1.amazonaws.com/$PTAU_FILE" -OutFile $ptauPath -UserAgent "Mozilla/5.0"
    }
}

# Compile the circuit
Write-Host "Compiling circuit..." -ForegroundColor Cyan
circom "$CIRCUIT_DIR/$CIRCUIT_NAME.circom" --r1cs --wasm --sym -o $BUILD_DIR -l node_modules

if ($LASTEXITCODE -ne 0) {
    Write-Host "Circuit compilation failed!" -ForegroundColor Red
    exit 1
}

# Generate zkey
Write-Host "Generating zkey..." -ForegroundColor Cyan
npx snarkjs groth16 setup "$BUILD_DIR/$CIRCUIT_NAME.r1cs" $ptauPath "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey"

# Contribute to the phase 2 ceremony
Write-Host "Contributing to ceremony..." -ForegroundColor Cyan
$entropy = [System.Guid]::NewGuid().ToString()
npx snarkjs zkey contribute "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey" "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" --name="1st Contributor" -v -e=$entropy

# Export verification key
Write-Host "Exporting verification key..." -ForegroundColor Cyan
npx snarkjs zkey export verificationkey "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" "$BUILD_DIR/verification_key.json"

# Export wasm for frontend
Write-Host "Preparing frontend assets..." -ForegroundColor Cyan
$webCircuitsDir = "..\web\public\circuits"
New-Item -ItemType Directory -Force -Path $webCircuitsDir | Out-Null
Copy-Item "$BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm" $webCircuitsDir -Force
Copy-Item "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" $webCircuitsDir -Force
Copy-Item "$BUILD_DIR/verification_key.json" $webCircuitsDir -Force

Write-Host "Circuit compilation complete!" -ForegroundColor Green
Write-Host "Files generated in $BUILD_DIR" -ForegroundColor Green
Write-Host "Frontend assets copied to $webCircuitsDir" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: cd .." -ForegroundColor Yellow
Write-Host "2. Run: pnpm db:seed" -ForegroundColor Yellow
Write-Host "3. Restart your dev servers" -ForegroundColor Yellow
