import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type Subscriber = (data: string) => void;

const subscribers = new Set<Subscriber>();

const GAME_CLIENT_ROOT = path.resolve("src/game-client");

function notify(filename: string): void {
  const payload = JSON.stringify({ filename });
  subscribers.forEach((fn) => fn(payload));
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function startFsWatcher(): void {
  if (!fs.existsSync(GAME_CLIENT_ROOT)) return;

  fs.watch(GAME_CLIENT_ROOT, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    if (!filename.endsWith(".ts") && !filename.endsWith(".tsx")) return;
    if (filename.includes("__pycache__") || filename.startsWith(".")) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => notify(filename), 500); // 500ms not 50ms
  });
}

if (process.env.NODE_ENV === "development") {
  startFsWatcher();
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  const encoder = new TextEncoder();
  let send: Subscriber | null = null;

  const stream = new ReadableStream({
    start(controller) {
      send = (data) => {
        try {
          controller.enqueue(encoder.encode(`event: reload\ndata: ${data}\n\n`));
        } catch {
          subscribers.delete(send!);
          send = null;
        }
      };
      subscribers.add(send);
    },
    cancel() {
      if (send) {
        subscribers.delete(send);
        send = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
