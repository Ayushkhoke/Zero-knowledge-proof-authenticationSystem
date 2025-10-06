import { Logger } from '@nestjs/common';
import * as snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';
import * as crypto from 'crypto';

export class ZkpUtils {
  private static readonly logger = new Logger(ZkpUtils.name);
  private static poseidonInstance: any = null;

  private static async getPoseidon() {
    if (!this.poseidonInstance) {
      this.poseidonInstance = await buildPoseidon();
    }
    return this.poseidonInstance;
  }

  static async generateCommitment(secret: string | bigint): Promise<string> {
    const poseidon = await this.getPoseidon();
    const secretBigInt = typeof secret === 'string' ? BigInt(secret) : secret;
    const hash = poseidon.F.toString(poseidon([secretBigInt]));
    return hash;
  }

  static async verifyProof(proof: any, publicSignals: any[], verificationKey: any): Promise<boolean> {
    try {
      const isValid = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);

      this.logger.log(`Proof verification result: ${isValid}`);
      return isValid;
    } catch (error) {
      this.logger.error(`Error verifying proof: ${error.message}`);
      return false;
    }
  }

  static validateProofStructure(proof: any): boolean {
    try {
      const requiredFields = ['pi_a', 'pi_b', 'pi_c'];
      return requiredFields.every((field) => proof.hasOwnProperty(field));
    } catch (error) {
      this.logger.error(`Error validating proof structure: ${error.message}`);
      return false;
    }
  }

  static validatePublicSignals(publicSignals: any[]): boolean {
    try {
      // Basic validation - ensure it's an array with expected length
      return Array.isArray(publicSignals) && publicSignals.length > 0;
    } catch (error) {
      this.logger.error(`Error validating public signals: ${error.message}`);
      return false;
    }
  }

  static commitmentToBigInt(commitment: string): string {
    // The commitment is already in BigInt string format from Poseidon
    return commitment;
  }

  static generateSecret(): bigint {
    const bytes = crypto.randomBytes(31); // Use 31 bytes to stay within field size
    return BigInt('0x' + bytes.toString('hex'));
  }

  static stringToBigInt(str: string): bigint {
    // Convert string to hex then to BigInt
    const hex = Buffer.from(str, 'utf8').toString('hex');
    return BigInt('0x' + hex);
  }
}
