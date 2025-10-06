import * as crypto from 'crypto-js';
// @ts-ignore
import { buildPoseidon } from 'circomlibjs';

// ZKP Client-side utilities
export class ZkpClientUtils {
  private static poseidonInstance: any = null;

  /**
   * Initialize Poseidon hash function
   */
  private static async getPoseidon() {
    if (!this.poseidonInstance) {
      this.poseidonInstance = await buildPoseidon();
    }
    return this.poseidonInstance;
  }

  /**
   * Generates a secure random secret
   */
  static generateSecret(): string {
    return crypto.lib.WordArray.random(32).toString();
  }

  /**
   * Converts string to BigInt for circuit input
   */
  static stringToBigInt(str: string): bigint {
    // Create a deterministic BigInt from string
    const hash = crypto.SHA256(str).toString();
    // Take first 62 hex chars to stay within field size (31 bytes)
    const truncatedHash = hash.substring(0, 62);
    return BigInt('0x' + truncatedHash);
  }

  /**
   * Generates a commitment from a secret using Poseidon hash
   * This matches the circuit implementation
   */
  static async generateCommitment(secret: string): Promise<string> {
    const poseidon = await this.getPoseidon();
    const secretBigInt = this.stringToBigInt(secret);
    const hash = poseidon.F.toString(poseidon([secretBigInt]));
    return hash;
  }

  /**
   * Generates a public key from a secret using Poseidon hash (double hash)
   * This serves as a public identifier derived from the secret
   */
  static async generatePublicKey(secret: string): Promise<string> {
    const poseidon = await this.getPoseidon();
    const secretBigInt = this.stringToBigInt(secret);
    const firstHash = poseidon([secretBigInt]);
    const secondHash = poseidon.F.toString(poseidon([firstHash]));
    return secondHash;
  }

  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Converts hex string to BigInt string for circuit compatibility
   */
  static hexToBigInt(hex: string): string {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    return BigInt('0x' + cleanHex).toString();
  }

  /**
   * Store secret securely in sessionStorage (for demo purposes)
   * In production, consider more secure storage options
   */
  static storeSecret(email: string, secret: string): void {
    sessionStorage.setItem(`zkp_secret_${email}`, secret);
  }

  /**
   * Retrieve stored secret
   */
  static getStoredSecret(email: string): string | null {
    return sessionStorage.getItem(`zkp_secret_${email}`);
  }

  /**
   * Clear stored secret
   */
  static clearStoredSecret(email: string): void {
    sessionStorage.removeItem(`zkp_secret_${email}`);
  }

  /**
   * Generate actual ZKP proof using snarkjs
   * Requires circuit files (wasm and zkey) to be in public/circuits
   */
  static async generateProof(secret: string): Promise<{
    proof: any;
    publicSignals: string[];
  }> {
    try {
      // Dynamically import snarkjs (client-side only)
      // @ts-ignore - snarkjs types may not be fully compatible
      const snarkjs = await import('snarkjs');

      const secretBigInt = this.stringToBigInt(secret);

      // Circuit inputs
      const input = {
        secret: secretBigInt.toString(),
      };

      // Generate witness and proof
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        '/circuits/auth.wasm',
        '/circuits/auth_final.zkey'
      );

      return { proof, publicSignals };
    } catch (error: any) {
      console.error('Error generating proof:', error);
      throw new Error(`Failed to generate ZKP proof: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate mock proof for development (fallback when circuit files are not available)
   * In production, this should not be used
   */
  static async generateMockProof(secret: string): Promise<{
    proof: any;
    publicSignals: string[];
  }> {
    const commitment = await this.generateCommitment(secret);

    // Mock proof structure (matches Groth16 format)
    const mockProof = {
      pi_a: [
        '0x' + crypto.lib.WordArray.random(32).toString(),
        '0x' + crypto.lib.WordArray.random(32).toString(),
        '0x1',
      ],
      pi_b: [
        ['0x' + crypto.lib.WordArray.random(32).toString(), '0x' + crypto.lib.WordArray.random(32).toString()],
        ['0x' + crypto.lib.WordArray.random(32).toString(), '0x' + crypto.lib.WordArray.random(32).toString()],
        ['0x1', '0x0'],
      ],
      pi_c: [
        '0x' + crypto.lib.WordArray.random(32).toString(),
        '0x' + crypto.lib.WordArray.random(32).toString(),
        '0x1',
      ],
    };

    return {
      proof: mockProof,
      publicSignals: [commitment],
    };
  }

  /**
   * Validate proof structure
   */
  static validateProof(proof: any): boolean {
    const requiredFields = ['pi_a', 'pi_b', 'pi_c'];
    return requiredFields.every((field) => proof && proof.hasOwnProperty(field));
  }
}
