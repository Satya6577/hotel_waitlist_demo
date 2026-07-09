// SeatFlow in-process event bus (SSE fanout)
// Uses globalThis so the singleton survives Next.js dev hot-reloads.

class EventBus {
  constructor() {
    this.listeners = new Set();
  }
  publish(event) {
    for (const cb of this.listeners) {
      try { cb(event); } catch {}
    }
  }
  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  size() { return this.listeners.size; }
}

const g = globalThis;
if (!g.__seatflow_bus__) g.__seatflow_bus__ = new EventBus();
export const eventBus = g.__seatflow_bus__;

export function publish(type, payload = {}) {
  eventBus.publish({
    id: (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)),
    type,
    payload,
    ts: Date.now(),
  });
}
