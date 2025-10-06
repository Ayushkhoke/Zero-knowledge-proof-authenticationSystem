# ZKP Circuit Setup Guide

## Prerequisites

1. Install Rust (required for circom):

   ```powershell
   # Download and run: https://rustup.rs/
   # Or use: winget install Rustlang.Rustup
   ```

2. Install circom compiler:

   ```powershell
   cargo install --git https://github.com/iden3/circom.git
   ```

3. Verify installation:
   ```powershell
   circom --version
   ```

## Compile Circuit

Once circom is installed, run:

```powershell
cd server
.\scripts\compile-circuit.ps1
```

This will:

- Download Powers of Tau ceremony file
- Compile the auth.circom circuit
- Generate proving and verification keys
- Copy circuit files to web/public/circuits/

## Files Generated

After compilation, you'll have:

- `circuits/build/auth.wasm` - Circuit WASM
- `circuits/build/auth_final.zkey` - Proving key
- `circuits/build/verification_key.json` - Verification key
- Files copied to `web/public/circuits/` for frontend use

## Update Database

Run the seed script to update the verification key in the database:

```powershell
pnpm db:seed
```

## Development Mode (Without Circuit Compilation)

For development without compiling circuits, the system uses:

- Poseidon hash for commitments (both frontend and backend)
- Mock proofs that verify commitment matching only
- Same security as password auth but with ZKP structure
