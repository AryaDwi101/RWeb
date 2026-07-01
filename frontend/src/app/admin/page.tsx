"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { apiGet, rp } from "@/lib/api";

type Summary = {
  sales_today: number;
  tx_today: number;
  avg_tx: number;
  total_7d: number;
  chart: { label: string; value: number }[];
  top_products: { name: string; qty: number; revenue: string }[];
};

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="bg-card border border-line rounded-xl px-5 py-4">
      <div className="text-xs text-sub">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${tone}`}>{value}</div>
    </div>
  );
}

export default function Laporan() {
  const [s, setS] = useState<Summary | null>(null);

  useEffect(() => {
    apiGet<Summary>("/reports/summary").then(setS);
  }, []);

  if (!s)
    return (
      <Shell area="admin">
        <p className="text-sub">Memuat…</p>
      </Shell>
    );

  const max = Math.max(...s.chart.map((c) => c.value), 1);

  return (
    <Shell area="admin">
      <h1 className="text-lg font-bold">Laporan Penjualan</h1>
      <p className="text-[12.5px] text-sub mb-4">
        Ringkasan performa penjualan restoran
      </p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Stat label="Penjualan Hari Ini" value={rp(s.sales_today)} tone="text-brandd" />
        <Stat label="Transaksi" value={String(s.tx_today)} tone="text-ink" />
        <Stat label="Rata-rata / Transaksi" value={rp(s.avg_tx)} tone="text-accent" />
        <Stat label="Total 7 Hari" value={rp(s.total_7d)} tone="text-amber" />
      </div>

      <div className="bg-card border border-line rounded-xl p-5 mb-4">
        <div className="font-bold mb-4">Penjualan 7 Hari Terakhir</div>
        <div className="flex items-end justify-between gap-3 h-48">
          {s.chart.map((c, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 justify-end h-full"
            >
              <div className="text-[10px] text-sub">
                {(c.value / 1000000).toFixed(1)}jt
              </div>
              <div
                className="w-full rounded-lg bg-brandbd"
                style={{ height: `${Math.max(6, (c.value / max) * 150)}px` }}
              />
              <div className="text-[11px] text-sub">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-line rounded-xl p-5">
        <div className="font-bold mb-3">Menu Terlaris</div>
        <div className="space-y-3">
          {s.top_products.map((p, i) => (
            <div key={i} className="flex items-center gap-3.5">
              <span className="w-7 h-7 rounded-lg bg-brandsoft text-brandd font-bold grid place-items-center text-sm">
                {i + 1}
              </span>
              <span className="font-semibold text-[13px]">{p.name}</span>
              <span className="flex-1" />
              <span className="text-xs text-sub">{p.qty} porsi</span>
              <span className="font-bold text-brandd text-[13px]">{rp(p.revenue)}</span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
