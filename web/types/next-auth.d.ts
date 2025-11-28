import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: string;
    token: string;
    authMethod?: string;
    blockchain?: {
      address: string | null;
      transactionHash: string | null;
      blockNumber: number | null;
      chainId: number | null;
    };
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      avatarUrl?: string;
      role: string;
      token: string;
      authMethod?: string;
      blockchain?: {
        address: string | null;
        transactionHash: string | null;
        blockNumber: number | null;
        chainId: number | null;
      };
    };
  }

  interface JWT {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: string;
    token: string;
    authMethod?: string;
    blockchain?: {
      address: string | null;
      transactionHash: string | null;
      blockNumber: number | null;
      chainId: number | null;
    };
  }
}
