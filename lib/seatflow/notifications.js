// Notification provider adapter — modular so we can swap wa.me/Twilio/MSG91 later
// Default provider: 'whatsapp_click' (staff clicks the pre-filled wa.me link)

export function buildWhatsAppUrl({ phone, message }) {
  if (!phone) return '';
  // Strip everything except digits and leading + for wa.me format (digits only, with country code, no plus)
  const digits = String(phone).replace(/[^\d]/g, '');
  const text = encodeURIComponent(message || '');
  return `https://wa.me/${digits}?text=${text}`;
}

export function buildTelUrl(phone) {
  if (!phone) return '';
  return `tel:${String(phone).replace(/\s+/g, '')}`;
}

export function tableReadyMessage({ customerName, tableNumber }) {
  return `🍽️ Hello ${customerName || 'there'},\n` +
    `Your reserved Table No. ${tableNumber} is now available.\n` +
    `Please arrive within the next 10 minutes.\n\n` +
    `Thank you for choosing Spice House!`;
}

// Provider registry — easily extend with Twilio/MSG91/Gupshup adapters later.
// Each provider exposes: id, label, kind ('client_link' | 'server_api'), send({ phone, message })
export const providers = {
  whatsapp_click: {
    id: 'whatsapp_click',
    label: 'Click-to-WhatsApp (free)',
    kind: 'client_link',
    send({ phone, message }) {
      return { ok: true, action: 'open_url', url: buildWhatsAppUrl({ phone, message }) };
    },
  },
  // Stubs — not yet configured. UI can list & later swap without code changes elsewhere.
  twilio_whatsapp: {
    id: 'twilio_whatsapp',
    label: 'Twilio WhatsApp API (paid)',
    kind: 'server_api',
    send() { return { ok: false, error: 'Not configured. Add TWILIO_* env vars.' }; },
  },
  msg91_sms: {
    id: 'msg91_sms',
    label: 'MSG91 SMS (paid)',
    kind: 'server_api',
    send() { return { ok: false, error: 'Not configured. Add MSG91_AUTH_KEY.' }; },
  },
};

export function activeProvider() {
  const id = process.env.NOTIFY_PROVIDER || 'whatsapp_click';
  return providers[id] || providers.whatsapp_click;
}

export function notifyTableReady({ customer, table }) {
  const p = activeProvider();
  const message = tableReadyMessage({ customerName: customer?.name, tableNumber: table?.number });
  return p.send({ phone: customer?.phone, message });
}
