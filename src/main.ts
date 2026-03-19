import { Engine } from "@babylonjs/core";
import { createScene } from "./world";
import { initPlayer, updatePlayer } from "./player";
import { initPlayers, updatePlayers } from "./players";
import { createTiles } from "./tiles";
import { initInput } from "./input";
import { connectWebSocket } from "./net";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

async function start() {
  console.log("🌐 Connecting...");
  await connectWebSocket();
  console.log("⏳ Waiting for login...");

  await new Promise<void>((resolve) => {
    window.addEventListener("loginSuccess", () => resolve(), { once: true });
  });

  console.log("🎮 Initialising game...");
  const scene = createScene(canvas, engine);

  initPlayer(scene);
  initPlayers(scene);
  createTiles(scene);
  initInput(scene);

  engine.runRenderLoop(() => {
    const delta = engine.getDeltaTime() / 1000;
    updatePlayer(delta);
    updatePlayers(delta);
    scene.render();
  });

  window.addEventListener("resize", () => engine.resize());
  console.log("✅ Game started");
}

start();
