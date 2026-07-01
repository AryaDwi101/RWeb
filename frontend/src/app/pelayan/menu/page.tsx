"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Shell from "@/components/Shell";
import { apiGet, apiPost, rp } from "@/lib/api";

type Category = { id: number; name: string };
type Product = { id: number; name: string; price: string; status: string; category_id: number };
type SessionResp = {
  session: { id: number; guest_count: number; dining_table: { number: string } };
};

function MenuInner() {
  const sp = useSearchParams();
  const sessionId = sp.get("session");

  const [cats, setCats] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [session, setSession] = useState<SessionResp["session"] | null>(null);
  const [activeCat, setActiveCat] = useState(0);
  const [cart, setCart] = useState<Record<number, { p: Product; qty: number }>>({});
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");

  useEffect(() => {
    apiGet<Category[]>("/categories").then(setCats);
    apiGet<Product[]>("/products").then(setProducts);
    if (sessionId) {
      apiGet<SessionResp>(`/sessions/${sessionId}`).then((r) => setSession(r.session));
    }
  }, [sessionId]);

  const add = (p: Product) =>
    setCart((c) => ({ ...c, [p.id]: { p, qty: (c[p.id]?.qty ?? 0) + 1 } }));
  const dec = (p: Product) =>
    setCart((c) => {
      const qty = (c[p.id]?.qty ?? 0) - 1;
      const next = { ...c };
      if (qty <= 0) delete next[p.id];
      else next[p.id] = { p, qty };
      return next;
    });

  const cartItems = Object.values(cart);
  const total = useMemo(
    () => cartItems.reduce((s, it) => s + parseFloat(it.p.price) * it.qty, 0),
    [cartItems]
  );

  const shown = products.filter((p) => !activeCat || p.category_id === activeCat);

  const kirim = async () => {
    if (!sessionId || cartItems.length === 0) return;
    setSending(true);
    try {
      await apiPost(`/sessions/${sessionId}/orders`, {
        items: cartItems.map((it) => ({ product_id: it.p.id, qty: it.qty })),
      });
      setSentMsg(`${cartItems.length} item terkirim ke dapur ✓`);
      setCart({});
      setTimeout(() => setSentMsg(""), 3000);
    } finally {
      setSending(false);
    }
  };

  if (!sessionId) {
    return (
      <Shell area="pelayan">
        <div className="text-center py-20">
          <p className="text-sub mb-3">Belum ada sesi meja yang dipilih.</p>
          <Link href="/pelayan" className="text-brandd font-bold">
            ← Pilih meja dulu di Denah Meja
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell area="pelayan">
      <div className="flex gap-5 h-full">
        {/* Menu area */}
        <div className="flex-1 min-w-0">
          <div className="bg-brandsoft border border-brandbd rounded-xl px-4 py-3 mb-4 flex justify-between items-center">
            <span className="font-bold text-brandd text-sm">
              Meja {session?.dining_table.number ?? "…"} · {session?.guest_count ?? ""} tamu
            </span>
            {sentMsg && <span className="text-xs text-brandd font-bold">{sentMsg}</span>}
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setActiveCat(0)}
              className={`h-9 px-4 rounded-lg text-xs border ${activeCat === 0 ? "bg-brand text-white border-brand" : "bg-card border-line"}`}
            >
              Semua
            </button>
            {cats.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`h-9 px-4 rounded-lg text-xs border ${activeCat === c.id ? "bg-brand text-white border-brand" : "bg-card border-line"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {shown.map((p) => {
              const habis = p.status === "habis";
              return (
                <div key={p.id} className="bg-card border border-line rounded-xl p-2.5 relative">
                  <div className="h-20 rounded-lg bg-bg2 grid place-items-center text-thumbTx text-xl text-[#c2c9d2]">
                    ▦
                  </div>
                  <h4 className="text-[12.5px] mt-3 mb-1.5 px-0.5">{p.name}</h4>
                  <div className="text-[13px] font-bold text-brandd px-0.5">{rp(p.price)}</div>
                  <button
                    disabled={habis}
                    onClick={() => add(p)}
                    className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-lg bg-brand text-white text-xl grid place-items-center disabled:opacity-40"
                    title={habis ? "Habis" : "Tambah"}
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <aside className="w-[320px] shrink-0 bg-card border border-line rounded-xl flex flex-col">
          <div className="px-5 py-4 border-b border-line">
            <div className="font-bold">Pesanan Baru</div>
            <div className="text-[11px] text-sub">Meja {session?.dining_table.number ?? "…"}</div>
          </div>
          <div className="flex-1 overflow-auto px-5">
            {cartItems.length === 0 && (
              <p className="text-sub text-sm text-center py-10">Belum ada item.</p>
            )}
            {cartItems.map((it) => (
              <div key={it.p.id} className="py-3.5 border-b border-line">
                <div className="text-[12.5px] font-bold">{it.p.name}</div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3 border border-line rounded-lg px-3 py-1">
                    <button onClick={() => dec(it.p)} className="text-sub">−</button>
                    <span className="text-[13px] font-semibold w-4 text-center">{it.qty}</span>
                    <button onClick={() => add(it.p)} className="text-brand font-bold">+</button>
                  </div>
                  <div className="text-[12.5px] font-bold">
                    {rp(parseFloat(it.p.price) * it.qty)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 pt-4 border-t border-line">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{rp(total)}</span>
            </div>
          </div>
          <button
            onClick={kirim}
            disabled={cartItems.length === 0 || sending}
            className="m-5 h-16 rounded-xl bg-brand text-white font-extrabold disabled:opacity-50"
          >
            {sending ? "Mengirim…" : "KIRIM KE DAPUR"}
          </button>
        </aside>
      </div>
    </Shell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-sub">Memuat…</div>}>
      <MenuInner />
    </Suspense>
  );
}
