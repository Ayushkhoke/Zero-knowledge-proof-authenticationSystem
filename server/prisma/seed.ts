import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Mock verification key for development
// In production, this would be the actual verification key from circuit compilation
const mockVerificationKey = {
  protocol: 'groth16',
  curve: 'bn128',
  nPublic: 1,
  vk_alpha_1: [
    '20491192805390485299153009773594534940189261866228447918068658471970481763042',
    '9383485363053290200918347156157836566562967994039712273449902621266178545958',
    '1',
  ],
  vk_beta_2: [
    [
      '6375614351688725206403948262868962793625744043794305715222011528459656738731',
      '4252822878758300859123897981450591353533073413197771768651442665752259397132',
    ],
    [
      '10505242626370262277552901082094356697409835680220590971873171140371331206856',
      '21847035105528745403288232691147584728191162732299865338377159692350059136679',
    ],
    ['1', '0'],
  ],
  vk_gamma_2: [
    [
      '10857046999023057135944570762232829481370756359578518086990519993285655852781',
      '11559732032986387107991004021392285783925812861821192530917403151452391805634',
    ],
    [
      '8495653923123431417604973247489272438418190587263600148770280649306958101930',
      '4082367875863433681332203403145435568316851327593401208105741076214120093531',
    ],
    ['1', '0'],
  ],
  vk_delta_2: [
    [
      '11559732032986387107991004021392285783925812861821192530917403151452391805634',
      '10857046999023057135944570762232829481370756359578518086990519993285655852781',
    ],
    [
      '4082367875863433681332203403145435568316851327593401208105741076214120093531',
      '8495653923123431417604973247489272438418190587263600148770280649306958101930',
    ],
    ['1', '0'],
  ],
  vk_alphabeta_12: [],
  IC: [
    ['21888242871839275222246405745257275088548364400416034343698204186575808495616', '0', '1'],
    ['21888242871839275222246405745257275088548364400416034343698204186575808495617', '0', '1'],
  ],
};

async function main() {
  console.log('🌱 Starting database seed...');

  // Try to load actual verification key if circuit is compiled
  let verificationKey = mockVerificationKey;
  const vkPath = path.join(__dirname, '..', 'circuits', 'build', 'verification_key.json');

  if (fs.existsSync(vkPath)) {
    console.log('✅ Found compiled verification key, using actual circuit data');
    verificationKey = JSON.parse(fs.readFileSync(vkPath, 'utf-8'));
  } else {
    console.log('ℹ️  No compiled circuit found, using mock verification key for development');
  }

  // Seed ZKP Circuit
  const existingCircuit = await prisma.zKPCircuit.findUnique({
    where: { circuitName: 'auth_circuit' },
  });

  if (!existingCircuit) {
    const circuit = await prisma.zKPCircuit.create({
      data: {
        circuitName: 'auth_circuit',
        wasmPath: '/circuits/auth.wasm',
        zkeyPath: '/circuits/auth_final.zkey',
        verificationKey: JSON.stringify(verificationKey),
        isActive: true,
      },
    });
    console.log('✅ Created ZKP circuit:', circuit.circuitName);
  } else {
    // Update verification key if circuit was recompiled
    await prisma.zKPCircuit.update({
      where: { circuitName: 'auth_circuit' },
      data: {
        verificationKey: JSON.stringify(verificationKey),
        isActive: true,
      },
    });
    console.log('✅ Updated ZKP circuit verification key');
  }

  console.log('🎉 Seed completed successfully!');
}
main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
