"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { apiGet, rp } from "@/lib/api";

type Bill = {
  session_id: number;
  table: string;
  guest_count: number;
  opened_at: string;
  item_count: number;
  total: number;
  status: string;
};
type Resp = {
  stats: { active: number; unpaid_total: number; done_today: number };
  bills: Bill[];
};

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="bg-card border border-line rounded-xl px-5 py-4">
      <div className="text-xs text-sub">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${tone}`}>{value}</div>
    </div>
  );
}

export default function Tagihan() {
  const [data, setData] = useState<Resp | null>(null);
  const router = useRouter();

  useEffect(() => {
    apiGet<Resp>("/bills").then(setData);
  }, []);

  if (!data)
    return (
      <Shell area="kasir">
        <p className="text-sub">Memuat…</p>
      </Shell>
    );

  const badge = (s: string) =>
    s === "sebagian"
      ? "bg-accentsoft text-accent"
      : s === "lunas"
        ? "bg-brandsoft text-brandd"
        : "bg-ambersoft text-amber";

  const cols = "grid-cols-[1fr_2fr_1fr_1.4fr_1.2fr_1.4fr]";

  return (
    <Shell area="kasir">
      <h1 className="text-lg font-bold">Daftar Tagihan</h1>
      <p className="text-[12.5px] text-sub mb-4">
        Pilih meja untuk diproses pembayarannya
      </p>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Stat label="Tagihan Aktif" value={String(data.stats.active)} tone="text-brandd" />
        <Stat label="Belum Dibayar" value={rp(data.stats.unpaid_total)} tone="text-amber" />
        <Stat label="Selesai Hari Ini" value={String(data.stats.done_today)} tone="text-accent" />
      </div>
      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <div className={`grid ${cols} px-5 py-3 bg-bg text-[11px] font-bold text-sub`}>
          <div>MEJA</div>
          <div>SESI</div>
          <div>ITEM</div>
          <div>TOTAL</div>
          <div>STATUS</div>
          <div>AKSI</div>
        </div>
        {data.bills.length === 0 && (
          <div className="px-5 py-8 text-center text-sub border-t border-line">
            Belum ada tagihan aktif.
          </div>
        )}
        {data.bills.map((b) => (
          <div
            key={b.session_id}
            className={`grid ${cols} px-5 py-3.5 items-center border-t border-line`}
          >
            <div className="font-bold">Meja {b.table}</div>
            <div className="text-xs text-sub">
              {b.opened_at} · {b.guest_count} tamu
            </div>
            <div className="text-[12.5px]">{b.item_count} item</div>
            <div className="font-bold text-brandd">{rp(b.total)}</div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${badge(b.status)}`}
              >
                {b.status}
              </span>
            </div>
            <div>
              <button
                onClick={() => router.push(`/kasir/bayar/${b.session_id}`)}
                className="bg-brand text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Proses Bayar
              </button>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
