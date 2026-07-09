'use client';
import { useEffect, useRef, useState } from 'react';

// Subscribe to SeatFlow SSE stream. Handlers keyed by event type.
// Pass a stable `enabled` boolean to avoid unnecessary connections.
export function useLiveEvents(handlers, enabled = true) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!enabled) return;
    let es;
    let cancelled = false;

    const connect = () => {
      try {
        es = new EventSource('/api/events/stream', { withCredentials: true });
      } catch {
        setStatus('error');
        return;
      }

      es.addEventListener('connected', () => setStatus('live'));
      es.onopen = () => setStatus('live');
      es.onerror = () => {
        setStatus('reconnecting');
        // EventSource auto-reconnects using `retry:` value we sent.
      };

      // Wildcard — register a handler per registered event type
      const attach = (type) => {
        es.addEventListener(type, (e) => {
          if (cancelled) return;
          let data;
          try { data = JSON.parse(e.data); } catch { data = e.data; }
          handlersRef.current?.[type]?.(data?.payload ?? data, data);
          handlersRef.current?.['*']?.(data?.payload ?? data, data);
        });
      };
      Object.keys(handlersRef.current || {}).forEach(attach);
    };

    connect();
    return () => {
      cancelled = true;
      try { es?.close(); } catch {}
      setStatus('idle');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return status;
}
