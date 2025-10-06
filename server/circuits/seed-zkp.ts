import { PrismaClient } from 'prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ZKP circuit data...');

  const mockVerificationKey = {
    protocol: 'groth16',
    curve: 'bn128',
    nPublic: 1,
    vk_alpha_1: ['0x1', '0x2', '0x1'],
    vk_beta_2: [
      ['0x1', '0x2'],
      ['0x3', '0x4'],
      ['0x1', '0x2'],
    ],
    vk_gamma_2: [
      ['0x1', '0x2'],
      ['0x3', '0x4'],
      ['0x1', '0x2'],
    ],
    vk_delta_2: [
      ['0x1', '0x2'],
      ['0x3', '0x4'],
      ['0x1', '0x2'],
    ],
    vk_alphabeta_12: [],
    IC: [
      ['0x1', '0x2', '0x1'],
      ['0x3', '0x4', '0x1'],
    ],
  };

  await prisma.zKPCircuit.upsert({
    where: {
      circuitName: 'auth_circuit',
    },
    update: {
      verificationKey: JSON.stringify(mockVerificationKey),
      isActive: true,
    },
    create: {
      circuitName: 'auth_circuit',
      wasmPath: '/circuits/auth.wasm',
      zkeyPath: '/circuits/auth_final.zkey',
      verificationKey: JSON.stringify(mockVerificationKey),
      isActive: true,
    },
  });

  console.log('✅ ZKP circuit seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
