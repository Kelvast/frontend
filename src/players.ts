import { Scene, MeshBuilder, Vector3 } from "@babylonjs/core";

const players = new Map<number, { mesh: any; targetPosition: Vector3 }>();

export function updatePlayer(playerId: number, x: number, y: number) {
    if (!players.has(playerId)) {
        const playerMesh = MeshBuilder.CreateBox(`player${playerId}`, { size: 1 }, scene);
        players.set(playerId, { mesh: playerMesh, targetPosition: new Vector3(x, 0, y) });
    }

    const player = players.get(playerId)!;
    player.targetPosition.copyFromFloats(x, 0, y);

    // Interpolation logic here
}

const scene = createScene(canvas);
