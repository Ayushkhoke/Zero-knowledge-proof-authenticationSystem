import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { config } from 'src/common/config';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  // Contract ABI from compiled JSON
  private readonly CONTRACT_ABI = [
    {
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'user',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'timestamp',
              type: 'uint256',
            },
          ],
          name: 'CommitmentDeactivated',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'user',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'emailHash',
              type: 'bytes32',
            },
            {
              indexed: false,
              internalType: 'string',
              name: 'commitment',
              type: 'string',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'timestamp',
              type: 'uint256',
            },
          ],
          name: 'CommitmentRegistered',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'user',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'string',
              name: 'newCommitment',
              type: 'string',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'timestamp',
              type: 'uint256',
            },
          ],
          name: 'CommitmentUpdated',
          type: 'event',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          name: 'commitments',
          outputs: [
            {
              internalType: 'string',
              name: 'commitment',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'email',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'publicKey',
              type: 'string',
            },
            {
              internalType: 'uint256',
              name: 'timestamp',
              type: 'uint256',
            },
            {
              internalType: 'bool',
              name: 'isActive',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'deactivateCommitment',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          name: 'emailToAddress',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'string',
              name: '_email',
              type: 'string',
            },
          ],
          name: 'getAddressByEmail',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_user',
              type: 'address',
            },
          ],
          name: 'getCommitment',
          outputs: [
            {
              internalType: 'string',
              name: 'commitment',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'email',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'publicKey',
              type: 'string',
            },
            {
              internalType: 'uint256',
              name: 'timestamp',
              type: 'uint256',
            },
            {
              internalType: 'bool',
              name: 'isActive',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_user',
              type: 'address',
            },
          ],
          name: 'isCommitmentActive',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'string',
              name: '_commitment',
              type: 'string',
            },
            {
              internalType: 'string',
              name: '_email',
              type: 'string',
            },
            {
              internalType: 'string',
              name: '_publicKey',
              type: 'string',
            },
          ],
          name: 'registerCommitment',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'string',
              name: '_newCommitment',
              type: 'string',
            },
          ],
          name: 'updateCommitment',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
    },
  ];

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      // Initialize provider (Sepolia RPC URL)
      const rpcUrl = config.blockchain.rpcUrl || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Initialize wallet with private key
      if (config.blockchain.privateKey) {
        this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
      }

      // Initialize contract
      if (config.blockchain.contractAddress) {
        this.contract = new ethers.Contract(
          config.blockchain.contractAddress,
          this.CONTRACT_ABI[0].abi,
          this.wallet || this.provider,
        );
      }

      this.logger.log('Blockchain service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain service', error);
    }
  }

  /**
   * Register a commitment on the blockchain
   */
  async registerCommitment(
    commitment: string,
    email: string,
    publicKey: string,
  ): Promise<{
    transactionHash: string;
    blockNumber: number;
    userAddress: string;
  }> {
    try {
      if (!this.contract || !this.wallet) {
        throw new Error('Blockchain service not properly configured');
      }

      this.logger.log(`Registering commitment for email: ${email}`);

      // Call the smart contract function
      const tx = await this.contract.registerCommitment(commitment, email, publicKey);

      this.logger.log(`Transaction sent: ${tx.hash}`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      this.logger.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        userAddress: this.wallet.address,
      };
    } catch (error) {
      this.logger.error(`Failed to register commitment on blockchain: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a commitment on the blockchain
   */
  async updateCommitment(newCommitment: string): Promise<{
    transactionHash: string;
    blockNumber: number;
  }> {
    try {
      if (!this.contract || !this.wallet) {
        throw new Error('Blockchain service not properly configured');
      }

      this.logger.log('Updating commitment on blockchain');

      const tx = await this.contract.updateCommitment(newCommitment);
      const receipt = await tx.wait();

      this.logger.log(`Commitment updated in block: ${receipt.blockNumber}`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to update commitment on blockchain: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get commitment from blockchain by address
   */
  async getCommitment(address: string): Promise<{
    commitment: string;
    email: string;
    publicKey: string;
    timestamp: bigint;
    isActive: boolean;
  }> {
    try {
      // Verify contract is initialized
      if (!this.contract) {
        throw new Error('Blockchain service not properly configured');
      }

      // Read commitment data from blockchain (no gas fees)
      const result = await this.contract.getCommitment(address);

      // Convert array result to object format
      return {
        commitment: result[0], // ZKP commitment hash
        email: result[1], // User's email
        publicKey: result[2], // User's public key
        timestamp: result[3], // Storage timestamp
        isActive: result[4], // Active status
      };
    } catch (error) {
      // Log and re-throw error
      this.logger.error(`Failed to get commitment from blockchain: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get blockchain address by email
   */
  async getAddressByEmail(email: string): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Blockchain service not properly configured');
      }

      const address = await this.contract.getAddressByEmail(email);
      return address;
    } catch (error) {
      this.logger.error(`Failed to get address by email from blockchain: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get commitment by email (convenience method)
   */
  async getCommitmentByEmail(email: string): Promise<{
    commitment: string;
    email: string;
    publicKey: string;
    timestamp: bigint;
    isActive: boolean;
  }> {
    try {
      // First get the address associated with this email
      const address = await this.getAddressByEmail(email);

      if (!address || address === ethers.ZeroAddress) {
        throw new Error('Email not found in blockchain');
      }

      // Then get the commitment data for that address
      return await this.getCommitment(address);
    } catch (error) {
      this.logger.error(`Failed to get commitment by email from blockchain: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if commitment is active on blockchain
   */
  async isCommitmentActive(address: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Blockchain service not properly configured');
      }

      const isActive = await this.contract.isCommitmentActive(address);
      return isActive;
    } catch (error) {
      this.logger.error(`Failed to check commitment status on blockchain: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deactivate commitment on blockchain
   */
  async deactivateCommitment(): Promise<{
    transactionHash: string;
    blockNumber: number;
  }> {
    try {
      if (!this.contract || !this.wallet) {
        throw new Error('Blockchain service not properly configured');
      }

      this.logger.log('Deactivating commitment on blockchain');

      const tx = await this.contract.deactivateCommitment();
      const receipt = await tx.wait();

      this.logger.log(`Commitment deactivated in block: ${receipt.blockNumber}`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to deactivate commitment on blockchain: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice || BigInt(0);
    } catch (error) {
      this.logger.error(`Failed to get gas price: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      this.logger.error(`Failed to get transaction receipt: ${error.message}`);
      throw error;
    }
  }
}
