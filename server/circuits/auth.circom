pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

// Simple authentication circuit
// Proves knowledge of a secret that hashes to a public commitment
template AuthCircuit() {
    // Private input (secret) - all inputs are private by default
    signal input secret;
    
    // Public output (commitment/hash)
    signal output commitment;
    
    // Hash the secret using Poseidon hash
    component hasher = Poseidon(1);
    hasher.inputs[0] <== secret;
    
    // Output the commitment
    commitment <== hasher.out;
}

// Main component - commitment will be public as an output
component main = AuthCircuit();