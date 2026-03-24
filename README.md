# MMO Client

A browser-based 3D MMO client built with **Next.js**, **Babylon.js**, and **Zustand**.

## Overview

This repository contains the client-side implementation of a tile-based multiplayer game. It features real-time player synchronization, a dynamic chunk-based world system, and an optimistic interaction model.

For detailed technical documentation, including the network protocol and core architecture, please see [CONTEXT.md](./CONTEXT.md).

## Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your environment variables.

### Development
Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack
- **Next.js (App Router)**: UI, routing, and API routes.
- **Babylon.js**: 3D rendering and game engine.
- **Zustand**: Lightweight state management.
- **WebSockets**: Real-time server communication.
- **Tailwind CSS**: Styling.

## Architecture Highlights
- **Optimistic Client / Authoritative Server**: Actions are reflected instantly on the client and validated by the server.
- **Binary Wire Protocol**: High-frequency world actions are sent as optimized 8-byte numeric tuples.
- **Security**: Per-session XOR encryption with HMAC-2B tamper-proofing.
- **Dynamic Chunking**: Chunks are loaded and unloaded dynamically around the player to support large worlds.

## License
[MIT](./LICENSE)
