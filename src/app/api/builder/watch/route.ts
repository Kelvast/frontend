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

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send: Subscriber = (data) => {
        try {
          controller.enqueue(encoder.encode(`event: chunk_changed\ndata: ${data}\n\n`));
        } catch {
          subscribers.delete(send);
        }
      };

      subscribers.add(send);

      controller.close = () => {
        subscribers.delete(send);
      };
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
