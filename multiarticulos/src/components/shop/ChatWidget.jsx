import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONTACT } from "@/config/site";

const SUGGESTIONS = [
  "¿Qué tenis tienen disponibles?",
  "Busco una fragancia de mujer",
  "¿Cuánto demora el envío?",
  "¿Qué métodos de pago aceptan?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      text: "¡Hola! Soy Vesti, tu asistente. Pregúntame por productos, precios, stock o envíos.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send(text) {
    const clean = String(text || "").trim();
    if (!clean || busy) return;
    setInput("");
    const next = [...msgs, { role: "user", text: clean }].slice(-13);
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          history: next.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      setMsgs((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.reply ||
            data.error ||
            "No pude responder. Intenta de nuevo.",
        },
      ]);
    } catch {
      setMsgs((prev) => [
        ...prev,
        { role: "assistant", text: "Sin conexión. Intenta de nuevo." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir chat de ayuda"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center bg-charcoal text-cream shadow-lift transition-colors hover:bg-sand hover:text-charcoal"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[480px] w-[calc(100vw-2.5rem)] max-w-sm flex-col border-2 border-charcoal bg-paper shadow-lift">
          <div className="flex items-center gap-2 bg-charcoal px-4 py-3 text-cream">
            <MessageCircle className="h-5 w-5 text-sand" />
            <div>
              <p className="font-display text-sm font-bold tracking-wider">Vesti · Ayuda</p>
              <p className="text-[11px] text-cream/70">En línea · responde al instante</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="ml-auto p-1 hover:text-sand"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {msgs.map((m, i) => (
              <p
                key={i}
                className={
                  m.role === "user"
                    ? "ml-8 bg-charcoal px-3 py-2 text-sm text-cream"
                    : "mr-8 border border-charcoal/10 bg-cream px-3 py-2 text-sm"
                }
              >
                {m.text}
              </p>
            ))}
            {busy && (
              <p className="mr-8 flex items-center gap-2 border border-charcoal/10 bg-cream px-3 py-2 text-sm text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Escribiendo…
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {msgs.length < 3 && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="border border-sand-dark/50 px-2 py-1 text-[11px] font-semibold text-sand-dark hover:bg-sand hover:text-charcoal"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex gap-2 border-t border-charcoal/10 p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              maxLength={500}
            />
            <Button type="submit" size="icon" disabled={busy} aria-label="Enviar">
              <Send />
            </Button>
          </form>
          <p className="px-3 pb-2 text-[10px] text-neutral-400">
            ¿Prefieres humano? WhatsApp {CONTACT.whatsapp}
          </p>
        </div>
      )}
    </>
  );
}
