"use client";

import { useCallback, useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { apiGet, apiPatch } from "@/lib/api";

type Item = {
  id: number;
  name: string;
  qty: number;
  course: number;
  status: string;
  table: string;
  time: string;
};

const COLS = [
  { key: "antrian", title: "Antrian", btn: "Mulai Masak", next: "dimasak", btnClass: "bg-brand" },
  { key: "dimasak", title: "Dimasak", btn: "Tandai Siap", next: "siap", btnClass: "bg-accent" },
  { key: "siap", title: "Siap", btn: "Antar ke Meja", next: "diantar", btnClass: "bg-brand" },
];

export default function Kitchen() {
  const [items, setItems] = useState<Item[]>([]);

  const load = useCallback(() => {
    apiGet<Item[]>("/kitchen").then(setItems).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const advance = async (it: Item, next: string) => {
    await apiPatch(`/kitchen/items/${it.id}`, { status: next });
    load();
  };

  return (
    <Shell area="koki">
      <h1 className="text-lg font-bold">Dapur — Kitchen Display</h1>
      <p className="text-[12.5px] text-sub mb-4">
        Antrian pesanan real-time per meja & course
      </p>
      <div className="grid grid-cols-3 gap-4">
        {COLS.map((col) => {
          const list = items.filter((i) => i.status === col.key);
          return (
            <div key={col.key} className="bg-bg2 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold">{col.title}</span>
                <span className="bg-card text-xs font-bold px-2.5 py-1 rounded-full">
                  {list.length}
                </span>
              </div>
              <div className="space-y-3">
                {list.map((it) => (
                  <div key={it.id} className="bg-card border border-line rounded-lg p-3.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[13px]">Meja {it.table}</span>
                      <span className="text-[11px] text-sub">🕐 {it.time}</span>
                    </div>
                    <span className="inline-block my-2 bg-accentsoft text-accent text-[10px] font-bold px-2 py-0.5 rounded">
                      Course #{it.course}
                    </span>
                    <div className="flex justify-between text-[12px]">
                      <span>{it.name}</span>
                      <span className="font-bold text-sub">×{it.qty}</span>
                    </div>
                    <button
                      onClick={() => advance(it, col.next)}
                      className={`w-full mt-3 h-8 rounded-lg text-white text-xs font-bold ${col.btnClass}`}
                    >
                      {col.btn}
                    </button>
                  </div>
                ))}
                {list.length === 0 && (
                  <p className="text-xs text-sub text-center py-4">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
