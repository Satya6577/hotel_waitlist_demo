'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { QrCode, Copy, Printer, Check, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export function CheckinQR() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') setUrl(`${window.location.origin}/checkin`);
  }, []);

  const qrSrc = url ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&color=065f46&bgcolor=ffffff&data=${encodeURIComponent(url)}` : '';

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); toast.success('Link copied'); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const print = () => {
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) return;
    w.document.write(`<html><head><title>SeatFlow — Guest Check-in QR</title><style>
      body{font-family:-apple-system,sans-serif;text-align:center;padding:48px 24px;color:#0f172a;background:#f8fafc}
      .card{background:white;border-radius:24px;padding:40px;max-width:420px;margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,0.06)}
      h1{font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#059669;margin:0 0 8px}
      h2{font-family:'Instrument Serif',Georgia,serif;font-size:34px;margin:0 0 8px;color:#0f172a}
      p{color:#64748b;font-size:15px;margin:0 0 24px}
      img{width:280px;height:280px}
      .foot{margin-top:24px;font-size:12px;color:#94a3b8}
    </style></head><body><div class="card">
      <h1>Guest Check-in</h1><h2>Scan to join the queue</h2>
      <p>Skip the line — add yourself to our waitlist in 30 seconds.</p>
      <img src="${qrSrc}" alt="QR code"/>
      <div class="foot">${url}</div>
    </div><script>window.onload=()=>{setTimeout(()=>window.print(),500)}</script></body></html>`);
    w.document.close();
  };

  return (
    <>
      <Card className="p-5 border-emerald-200/60 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/60 via-card to-card dark:from-emerald-950/30">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white grid place-items-center shrink-0"><QrCode className="h-6 w-6" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Guest self check-in</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">Live</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Guests scan the QR code to join the queue from their phone.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1"><QrCode className="h-3.5 w-3.5" /> Show QR</Button>
              <Button size="sm" variant="outline" onClick={copy} className="gap-1">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy link</Button>
              <Button size="sm" variant="ghost" onClick={print} className="gap-1"><Printer className="h-3.5 w-3.5" /> Print poster</Button>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden gap-0">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white px-6 py-5">
            <DialogTitle className="text-white text-xl font-semibold">Guest check-in QR</DialogTitle>
            <DialogDescription className="text-emerald-100 text-sm">Place this at your host stand or table entrance</DialogDescription>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-2xl bg-white p-5 flex items-center justify-center">
              {qrSrc ? (
                <img src={qrSrc} alt="Check-in QR" width={280} height={280} className="rounded-lg" />
              ) : (
                <div className="h-[280px] w-[280px] bg-muted animate-pulse rounded-lg" />
              )}
            </div>
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground break-all font-mono">{url}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Smartphone className="h-3.5 w-3.5" /> Works on any smartphone camera · no app required.
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 gap-1" onClick={copy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy link</Button>
              <Button className="flex-1 gap-1" onClick={print}><Printer className="h-4 w-4" /> Print poster</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
