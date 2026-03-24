# MMO Client

A browser-based 3D MMO client built with **Next.js**, **Babylon.js**, and **Zustand**.

## Overview
Players move around a tile-based world, interact with others in real-time, and progress through various skills and quests. The project is currently in an active \"green field\" state with the core network protocol and rendering engine established.

## Key Features
*   **High-Performance 3D Rendering**: Powered by Babylon.js with a custom chunk-based world system.
*   **Binary Wire Protocol**: Optimized 8-byte numeric tuples for high-frequency world actions.
*   **Secure Communication**: Per-session XOR encryption with HMAC-2B signature validation.
*   **Real-time Multiplayer**: Bidirectional sync via WebSockets.
*   **State Management**: Lightweight game state handled by Zustand.

## Getting Started

### Prerequisites
*   Node.js (Latest LTS recommended)
*   npm or yarn

### Installation
1.  Clone the repository
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables in `.env`.

### Development
Run the development server:
```bash
npm run dev
```

## Architecture Details
For a deep dive into the project's architecture, including coordinate systems, chunk loading strategies, and the detailed network protocol, please see [CONTEXT.md](./CONTEXT.md).

## License
[MIT](./LICENSE)
