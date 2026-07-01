"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { apiGet, apiPost, rp } from "@/lib/api";

type Item = { id: number; name: string; price: string; qty: number; course: number };
type Order = { id: number; course: number; items: Item[] };
type BillResp = {
  session: { id: number; guest_count: number; dining_table: { number: string }; orders: Order[] };
  subtotal: number;
  tax: number;
  total: number;
};

const METHODS = [
  { key: "tunai", label: "Tunai", icon: "▤" },
  { key: "qris", label: "QRIS", icon: "▦" },
  { key: "debit", label: "Kartu Debit", icon: "▬" },
];

export default function Bayar() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();

  const [bill, setBill] = useState<BillResp | null>(null);
  const [method, setMethod] = useState("tunai");
  const [received, setReceived] = useState("");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState<{ change: number; total: number } | null>(null);

  useEffect(() => {
    apiGet<BillResp>(`/sessions/${id}`).then((b) => {
      setBill(b);
      setReceived(String(b.total));
    });
  }, [id]);

  const change = useMemo(() => {
    const r = parseFloat(received) || 0;
    return Math.max(0, r - (bill?.total ?? 0));
  }, [received, bill]);

  const pay = async () => {
    if (!bill) return;
    setPaying(true);
    try {
      const res = await apiPost<{ payment: { change: string; total: string } }>(
        `/sessions/${id}/pay`,
        { method, amount_received: parseFloat(received) || bill.total, discount: 0 }
      );
      setDone({
        change: parseFloat(res.payment.change),
        total: parseFloat(res.payment.total),
      });
    } finally {
      setPaying(false);
    }
  };

  if (!bill) {
    return (
      <Shell area="kasir">
        <p className="text-sub">Memuat…</p>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell area="kasir">
        <div className="max-w-[460px] mx-auto text-center py-10">
          <div className="w-16 h-16 rounded-full bg-brandsoft text-brandd text-3xl grid place-items-center mx-auto">
            ✓
          </div>
          <h2 className="text-xl font-extrabold mt-4">Pembayaran Berhasil</h2>
          <p className="text-sub text-sm mt-1">
            Sesi Meja {bill.session.dining_table.number} telah ditutup
          </p>
          <div className="bg-card border border-line rounded-xl p-6 mt-5 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-sub">Total</span>
              <span className="font-bold">{rp(done.total)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-sub">Metode</span>
              <span className="font-bold capitalize">{method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sub">Kembalian</span>
              <span className="font-bold text-brandd">{rp(done.change)}</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/kasir")}
            className="mt-5 h-11 px-6 rounded-xl bg-brand text-white font-bold"
          >
            Transaksi Baru →
          </button>
        </div>
      </Shell>
    );
  }

  const items = bill.session.orders.flatMap((o) => o.items);

  return (
    <Shell area="kasir">
      <div className="flex gap-5">
        {/* Bill */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold">
            Pembayaran · Meja {bill.session.dining_table.number}
          </h1>
          <p className="text-[12.5px] text-sub mb-4">
            {bill.session.guest_count} tamu · Kasir
          </p>
          <div className="bg-card border border-line rounded-xl p-6">
            <h3 className="font-bold mb-4">Rincian Bill</h3>
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-[12.5px] py-1.5">
                <span>
                  {it.name} ×{it.qty}
                </span>
                <span>{rp(parseFloat(it.price) * it.qty)}</span>
              </div>
            ))}
            <hr className="my-4 border-line" />
            <div className="flex justify-between text-[13px] text-sub mb-2">
              <span>Subtotal</span>
              <span>{rp(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-sub mb-2">
              <span>Pajak 10%</span>
              <span>{rp(bill.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL</span>
              <span className="text-brandd">{rp(bill.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment panel */}
        <aside className="w-[400px] shrink-0 bg-card border border-line rounded-xl p-6">
          <h3 className="font-bold mb-3.5">Metode Pembayaran</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {METHODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`h-[74px] rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs ${
                  method === m.key
                    ? "bg-brandsoft border-brand border-2 text-ink font-bold"
                    : "border-line text-sub"
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
          <div className="text-[12.5px] text-sub mb-2">Nominal Diterima</div>
          <input
            value={received}
            onChange={(e) => setReceived(e.target.value)}
            type="number"
            className="w-full h-14 px-4 rounded-xl border border-line text-2xl font-bold outline-none focus:border-brand mb-3"
          />
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[50000, 100000, bill.total].map((v, i) => (
              <button
                key={i}
                onClick={() => setReceived(String(v))}
                className="h-9 rounded-lg bg-bg2 text-xs"
              >
                {i === 2 ? "Uang Pas" : "+" + v / 1000 + "rb"}
              </button>
            ))}
          </div>
          <div className="bg-brandsoft border border-brandbd rounded-xl px-4 py-3.5 flex justify-between items-center mb-5">
            <span className="text-[13px] text-brandd">Kembalian</span>
            <span className="text-2xl font-bold text-brandd">{rp(change)}</span>
          </div>
          <button
            onClick={pay}
            disabled={paying}
            className="w-full h-16 rounded-xl bg-brand text-white font-extrabold disabled:opacity-60"
          >
            {paying ? "Memproses…" : "KONFIRMASI BAYAR"}
          </button>
        </aside>
      </div>
    </Shell>
  );
}
