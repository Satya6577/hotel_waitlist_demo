'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, X, PartyPopper } from 'lucide-react';
import { buildWhatsAppUrl, buildTelUrl, tableReadyMessage } from '@/lib/seatflow/notifications';

// Popup shown when a reserved table becomes available. Persistent until dismissed.
export function NotifyReadyPopup({ open, item, onClose, onSent }) {
  useEffect(() => {
    if (!open) return;
    // Auto-play a short beep would be nice but skip for now
  }, [open]);

  if (!open || !item) return null;

  const message = tableReadyMessage({ customerName: item.customer?.name, tableNumber: item.table?.number });
  const waUrl = buildWhatsAppUrl({ phone: item.customer?.phone, message });
  const telUrl = buildTelUrl(item.customer?.phone);

  const openWa = () => { window.open(waUrl, '_blank', 'noopener'); onSent?.(); };
  const callCustomer = () => { window.location.href = telUrl; };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm grid place-items-center p-4"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="w-full max-w-md rounded-3xl overflow-hidden bg-card border shadow-2xl"
        >
          <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-700 text-white px-6 py-6">
            <button onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 grid place-items-center"><X className="h-4 w-4" /></button>
            <div className="h-14 w-14 rounded-2xl bg-white/20 grid place-items-center mb-3"><PartyPopper className="h-7 w-7" /></div>
            <div className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">Table Ready</div>
            <div className="font-serif text-3xl leading-tight mt-1">Table {String(item.table?.number).padStart(2, '0')} is now available</div>
            <div className="mt-2 text-sm text-emerald-100">Notify {item.customer?.name} to head over.</div>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-xl border p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Reserved for</div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-lg">{item.customer?.name}</div>
                  {item.customer?.phone && <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {item.customer.phone}</div>}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 border p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Message preview</div>
              <pre className="text-xs whitespace-pre-wrap font-sans text-foreground/85">{message}</pre>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button className="h-11 gap-2 bg-green-600 hover:bg-green-700" onClick={openWa} disabled={!item.customer?.phone}>
                <MessageCircle className="h-4 w-4" /> Notify via WhatsApp
              </Button>
              <Button variant="outline" className="h-11 gap-2" onClick={callCustomer} disabled={!item.customer?.phone}>
                <Phone className="h-4 w-4" /> Call customer
              </Button>
            </div>

            {!item.customer?.phone && (
              <div className="text-[11px] text-amber-700 dark:text-amber-400 text-center">No phone number on file — add one when creating the reservation.</div>
            )}

            <div className="text-[11px] text-muted-foreground text-center">The WhatsApp adapter can be swapped for Twilio, MSG91 or Gupshup later without code changes.</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
