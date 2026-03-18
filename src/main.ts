import { updatePlayer } from "./players";
import { connectWebSocket } from "./net";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    const engine = new BABYLON.Engine(canvas, true);
    const scene = createScene(canvas);

    function renderLoop() {
        engine.runRenderLoop(() => {
            scene.render();
        });
    }

    window.addEventListener("resize", () => {
        engine.resize();
    });

    canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh?.name.startsWith("ground")) {
            const { x, y } = pickResult.pickedPoint!;
            connectWebSocket().send(JSON.stringify({ type: "click", targetX: x, targetY: y }));
        }
    });

    renderLoop();
});
