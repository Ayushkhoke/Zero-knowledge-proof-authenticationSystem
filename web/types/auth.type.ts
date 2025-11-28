export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: UserRole;
    authMethod?: string;
    blockchain?: {
      address: string | null;
      transactionHash: string | null;
      blockNumber: number | null;
      chainId: number | null;
    };
  };
};

export type ZkpRegisterRequest = {
  email: string;
  commitment: string;
  publicKey?: string;
  name?: string;
};

export type ZkpLoginRequest = {
  email: string;
  proof: string;
  publicSignals: string;
};

export type ZkpRegisterResponse = {
  success: boolean;
  message: string;
  userId: string;
};

export type ZkpStatusResponse = {
  isRegistered: boolean;
  hasPublicKey: boolean;
  userId?: string;
};

export type ZkpProof = {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
};

export type CircuitInputs = {
  secret: string;
};
