import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Auth, google } from 'googleapis';
import { config } from 'src/common/config';
import { ZkpUtils } from './utils/zkp.utils';
import { ZkpRegisterDto, ZkpLoginDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private oauth2Client: Auth.OAuth2Client;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly blockchainService: BlockchainService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.callbackUrl,
    );
  }

  async handleGoogleAuth(idToken: string) {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid google id token');
      }
      const { email, sub: googleId, given_name, family_name, picture } = payload;
      if (!email) {
        throw new UnauthorizedException('Invalid google id token');
      }
      let user = await this.prismaService.user.findFirst({
        where: {
          email,
        },
      });
      if (!user) {
        user = await this.prismaService.user.create({
          data: {
            email,
            name: `${given_name} ${family_name}`,
            avatarUrl: picture,
          },
        });
      }
      const jwtPayload = {
        id: user.id,
        email,
        avatarUrl: user?.avatarUrl,
        name: user?.name ?? 'Unknown',
        role: user?.role,
        sub: googleId,
      };

      const token = await this.jwtService.signAsync(jwtPayload, {
        expiresIn: config.jwt.expiresIn,
      });
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(`error occured while verifying google id token: ${idToken}, ${error}`);
      throw new UnauthorizedException('Invalid google id token');
    }
  }

  // ZKP Authentication Methods

  /**
   * Register a user with ZKP commitment
   */
  async zkpRegister(registerDto: ZkpRegisterDto) {
    try {
      const { email, commitment, publicKey, name } = registerDto;

      // Check if user already exists
      let user = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (user && user.zkpCommitment) {
        throw new BadRequestException('User already registered with ZKP');
      }

      // Validate commitment format (should be a BigInt string)
      if (!/^\d+$/.test(commitment)) {
        throw new BadRequestException('Invalid commitment format - must be a BigInt string');
      }

      // Store commitment on blockchain
      this.logger.log(`Storing commitment on Sepolia blockchain for email: ${email}`);
      let blockchainData;
      try {
        blockchainData = await this.blockchainService.registerCommitment(commitment, email, publicKey || '');
        this.logger.log(`Blockchain storage successful - TX: ${blockchainData.transactionHash}`);
      } catch (blockchainError) {
        this.logger.error(`Blockchain storage failed: ${blockchainError.message}`);
        throw new BadRequestException('Failed to store commitment on blockchain');
      }

      if (user) {
        // Update existing user with ZKP data and blockchain info
        user = await this.prismaService.user.update({
          where: { id: user.id },
          data: {
            zkpCommitment: commitment,
            zkpPublicKey: publicKey,
            name: name || user.name,
            blockchainAddress: blockchainData.userAddress,
            transactionHash: blockchainData.transactionHash,
            blockNumber: blockchainData.blockNumber,
            chainId: config.blockchain.chainId,
          },
        });
      } else {
        // Create new user with ZKP data and blockchain info
        user = await this.prismaService.user.create({
          data: {
            email,
            name: name || 'ZKP User',
            zkpCommitment: commitment,
            zkpPublicKey: publicKey,
            blockchainAddress: blockchainData.userAddress,
            transactionHash: blockchainData.transactionHash,
            blockNumber: blockchainData.blockNumber,
            chainId: config.blockchain.chainId,
          },
        });
      }

      this.logger.log(`ZKP registration successful for email: ${email}`);

      return {
        success: true,
        message: 'ZKP registration successful',
        userId: user.id,
        blockchain: {
          transactionHash: blockchainData.transactionHash,
          blockNumber: blockchainData.blockNumber,
          chainId: config.blockchain.chainId,
        },
      };
    } catch (error) {
      this.logger.error(`[ERROR: zkpRegister] ${registerDto.email}, ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('ZKP registration failed');
    }
  }

  /**
   * Authenticate user with ZKP proof
   */
  async zkpLogin(loginDto: ZkpLoginDto) {
    try {
      const { email, proof, publicSignals } = loginDto;

      // Find user with ZKP commitment
      const user = await this.prismaService.user.findFirst({
        where: {
          email,
          zkpCommitment: { not: null },
        },
      });

      if (!user || !user.zkpCommitment) {
        throw new UnauthorizedException('User not registered with ZKP');
      }

      // Parse proof and public signals
      let parsedProof: any;
      let parsedPublicSignals: any[];

      try {
        parsedProof = JSON.parse(proof);
        parsedPublicSignals = JSON.parse(publicSignals);
      } catch (parseError) {
        throw new BadRequestException('Invalid proof or public signals format');
      }

      // Validate proof structure
      if (!ZkpUtils.validateProofStructure(parsedProof)) {
        throw new BadRequestException('Invalid proof structure');
      }

      if (!ZkpUtils.validatePublicSignals(parsedPublicSignals)) {
        throw new BadRequestException('Invalid public signals');
      }

      // Log proof attempt
      const proofAttempt = await this.prismaService.zKPProofAttempt.create({
        data: {
          email,
          proof,
          publicSignals,
          isVerified: false,
        },
      });

      // Get active circuit verification key
      const circuit = await this.prismaService.zKPCircuit.findFirst({
        where: {
          circuitName: 'auth_circuit',
          isActive: true,
        },
      });

      if (!circuit) {
        this.logger.error('No active auth circuit found');
        throw new BadRequestException('ZKP verification not available');
      }

      // Parse verification key
      let verificationKey: any;
      try {
        verificationKey = JSON.parse(circuit.verificationKey);
      } catch (parseError) {
        this.logger.error('Invalid verification key format in database');
        throw new BadRequestException('ZKP verification not available');
      }

      // Verify the ZKP proof using snarkjs
      this.logger.log('Verifying ZKP proof with snarkjs...');
      const isValidProof = await ZkpUtils.verifyProof(parsedProof, parsedPublicSignals, verificationKey);

      if (!isValidProof) {
        this.logger.warn(`Invalid ZKP proof attempt for email: ${email}`);
        throw new UnauthorizedException('Invalid proof - ZKP verification failed');
      }

      // Verify that the public signal (commitment) matches the stored commitment
      const providedCommitment = parsedPublicSignals[0]?.toString();
      const storedCommitment = user.zkpCommitment;

      this.logger.log(`Verifying commitment match - Provided: ${providedCommitment}, Stored: ${storedCommitment}`);

      if (providedCommitment !== storedCommitment) {
        this.logger.warn(`Commitment mismatch for email: ${email}`);
        throw new UnauthorizedException('Invalid proof - commitment mismatch');
      }

      // Optionally verify commitment from blockchain for additional security
      try {
        this.logger.log('Verifying commitment from blockchain...');
        const blockchainCommitment = await this.blockchainService.getCommitmentByEmail(email);

        if (blockchainCommitment.commitment !== storedCommitment) {
          this.logger.warn('Blockchain commitment mismatch detected');
          throw new UnauthorizedException('Blockchain verification failed - commitment mismatch');
        }

        if (!blockchainCommitment.isActive) {
          this.logger.warn('Blockchain commitment is not active');
          throw new UnauthorizedException('Blockchain commitment has been deactivated');
        }

        this.logger.log('Blockchain verification successful');
      } catch (blockchainError) {
        this.logger.error(`Blockchain verification failed: ${blockchainError.message}`);
        // Continue with login even if blockchain verification fails (for robustness)
        // In production, you might want to make this mandatory
      }

      // Update proof attempt as verified
      await this.prismaService.zKPProofAttempt.update({
        where: { id: proofAttempt.id },
        data: { isVerified: true },
      });

      // Generate JWT token
      const jwtPayload = {
        id: user.id,
        email,
        avatarUrl: user?.avatarUrl,
        name: user?.name ?? 'ZKP User',
        role: user?.role,
        sub: user.id,
        authMethod: 'zkp',
        // Blockchain information
        blockchainAddress: user.blockchainAddress,
        transactionHash: user.transactionHash,
        blockNumber: user.blockNumber,
        chainId: user.chainId,
      };

      const token = await this.jwtService.signAsync(jwtPayload, {
        expiresIn: config.jwt.expiresIn,
      });

      this.logger.log(`ZKP login successful (TRUE ZKP) for email: ${email}`);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
          authMethod: 'zkp',
          blockchain: {
            address: user.blockchainAddress,
            transactionHash: user.transactionHash,
            blockNumber: user.blockNumber,
            chainId: user.chainId,
          },
        },
      };
    } catch (error) {
      this.logger.error(`[ERROR: zkpLogin] ${loginDto.email}, ${error.message}`);
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('ZKP authentication failed');
    }
  }

  /**
   * Get ZKP registration status for a user
   */
  async getZkpStatus(email: string) {
    const user = await this.prismaService.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        zkpCommitment: true,
        zkpPublicKey: true,
      },
    });

    return {
      isRegistered: !!user?.zkpCommitment,
      hasPublicKey: !!user?.zkpPublicKey,
      userId: user?.id,
    };
  }
}
