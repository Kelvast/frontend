import { NextResponse } from "next/server";

type Subscriber = (data: string) => void;

const subscribers = new Set<Subscriber>();

export function notifyChunkChanged(regionId: string, chunkX: number, chunkZ: number): void {
  const payload = JSON.stringify({ regionId, chunkX, chunkZ });
  subscribers.forEach((fn) => fn(payload));
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send: Subscriber = (data) => {
        controller.enqueue(encoder.encode(`event: chunk_changed\ndata: ${data}\n\n`));
      };

      subscribers.add(send);

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15000);

      const cleanup = () => {
        clearInterval(keepAlive);
        subscribers.delete(send);
      };

      controller.close = cleanup;
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
