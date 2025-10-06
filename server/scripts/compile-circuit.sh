#!/bin/bash

# Script to compile the Circom circuit and generate keys
# This needs circom and snarkjs installed globally

set -e

CIRCUIT_NAME="auth"
CIRCUIT_DIR="circuits"
BUILD_DIR="circuits/build"
PTAU_FILE="powersOfTau28_hez_final_12.ptau"

echo "🔧 Setting up circuit compilation..."

# Create build directory
mkdir -p $BUILD_DIR

# Download Powers of Tau if not exists
if [ ! -f "$BUILD_DIR/$PTAU_FILE" ]; then
    echo "📥 Downloading Powers of Tau file..."
    wget -P $BUILD_DIR https://hermez.s3-eu-west-1.amazonaws.com/$PTAU_FILE
fi

# Compile the circuit
echo "⚙️  Compiling circuit..."
circom $CIRCUIT_DIR/$CIRCUIT_NAME.circom --r1cs --wasm --sym -o $BUILD_DIR

# Generate witness
echo "🔑 Generating zkey..."
snarkjs groth16 setup $BUILD_DIR/$CIRCUIT_NAME.r1cs $BUILD_DIR/$PTAU_FILE $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey

# Contribute to the phase 2 ceremony
echo "🎲 Contributing to ceremony..."
snarkjs zkey contribute $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey --name="1st Contributor" -v -e="random entropy"

# Export verification key
echo "📤 Exporting verification key..."
snarkjs zkey export verificationkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey $BUILD_DIR/verification_key.json

# Export wasm for frontend
echo "📦 Preparing frontend assets..."
mkdir -p ../web/public/circuits
cp $BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm ../web/public/circuits/
cp $BUILD_DIR/${CIRCUIT_NAME}_final.zkey ../web/public/circuits/
cp $BUILD_DIR/verification_key.json ../web/public/circuits/

echo "✅ Circuit compilation complete!"
echo "📁 Files generated in $BUILD_DIR"
echo "📁 Frontend assets copied to ../web/public/circuits"
