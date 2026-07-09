// Server-Sent Events endpoint for real-time SeatFlow updates.
// Every mutation across queue/tables/sections/waiters/users publishes to this stream.

import { eventBus } from '@/lib/events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const safeEnqueue = (chunk) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(chunk)); } catch { closed = true; }
      };

      // Initial connected event so clients know they're live
      safeEnqueue(`retry: 3000\n\n`);
      safeEnqueue(`event: connected\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);

      const unsubscribe = eventBus.subscribe((event) => {
        const evtType = String(event?.type || 'message').replace(/[^a-zA-Z0-9._-]/g, '_');
        safeEnqueue(`event: ${evtType}\ndata: ${JSON.stringify(event)}\n\n`);
      });

      // Heartbeat every 20s to keep proxies/load balancers happy
      const heartbeat = setInterval(() => {
        safeEnqueue(`: ping ${Date.now()}\n\n`);
      }, 20000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try { controller.close(); } catch {}
      };

      request.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
