Zero-Knowledge Proof Authentication System

A privacy-focused authentication system that lets a user prove they know a secret (such as a password) without ever sending the secret to the server. The login flow uses zk-SNARK proofs built with Circom and snarkjs, and is integrated into a full-stack web application.

Status: [In development / Completed] · Author: Ayush Khoke

<!-- TODO: add a screenshot or short demo GIF here --> <!-- ![Demo](./docs/demo.png) -->
Why this project

In a traditional login, the password (or a hash of it) travels to the server, so a compromised server or a network leak exposes credentials. This project explores a different approach: the client generates a zero-knowledge proof that it knows the secret, and the server only verifies the proof. The secret never leaves the user's device.

Features
Privacy-focused authentication using zero-knowledge proofs
zk-SNARK proof generation and verification with Circom and snarkjs
Cryptographic proof verification integrated into a full-stack web application
Authentication workflow that proves knowledge of a secret without revealing the secret itself
[Add any other feature that exists in your code, for example: session/JWT issuing after a valid proof]
How it works
Registration – The user chooses a secret. The client derives a public value from it (a commitment) and sends only that value to the server. The secret itself is never sent or stored.
Login – The client generates a zk-SNARK proof, using a Circom circuit, that it knows a secret matching the stored public value.
Verification – The server checks the proof against the circuit's verification key using snarkjs. If it is valid, the user is authenticated.
Client                                   Server
  |  -- register: public commitment -->    |   stores commitment only
  |                                        |
  |  <-- login challenge ----------------  |
  |  generate proof (Circom + snarkjs)     |
  |  -- proof + public signals ---------> |   verify with verification key
  |  <-- authenticated / rejected -------  |
<!-- TODO: confirm this flow matches your implementation and edit any step that differs -->
Tech stack
Layer	Technology
Frontend	[React.js or Next.js], Tailwind CSS
Backend	[Node.js with Express.js or NestJS]
Database	[MongoDB or Prisma + your database]
Zero-knowledge	Circom, snarkjs (zk-SNARKs)
<!-- TODO: keep only the technologies this repository actually uses -->
Project structure
├── web/        # Frontend
├── server/     # Backend API and proof verification
├── docs/       # Documentation
└── [circuits/] # Circom circuit(s), if kept in this repo
<!-- TODO: update to match your real folders -->
Getting started
Prerequisites
Node.js [version]
[pnpm / npm]
Circom and snarkjs installed (see their official docs)
[Database, for example MongoDB running locally or a connection string]
Setup
bash
# 1. Clone the repository
git clone https://github.com/Ayushkhoke/Zero-knowledge-proof-authenticationSystem.git
cd Zero-knowledge-proof-authenticationSystem

# 2. Install dependencies
cd server && [pnpm install]
cd ../web && [pnpm install]

# 3. Environment variables
# copy .env.example to .env in each folder and fill in the values
Compile the circuit (if applicable)
bash
# [add your actual Circom compile / trusted setup / key generation commands]
Run
bash
# Backend
cd server && [pnpm start:dev]

# Frontend
cd web && [pnpm dev]
<!-- TODO: replace every [bracketed] item with the real command from your project -->
Security notes
The secret never leaves the client; the server stores only a public value.
Proofs are verified on the server using the circuit's verification key.
This is a learning and demonstration project and has not had a professional security audit.
What I learned
How zk-SNARKs let you prove knowledge of a value without revealing it
Writing and compiling a Circom circuit and generating and verifying proofs with snarkjs
Integrating cryptographic proof verification into a full-stack web application
Author

Ayush Khoke – GitHub · LinkedIn
