"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { apiGet, apiPost } from "@/lib/api";

type Table = {
  id: number;
  number: string;
  area: string;
  capacity: number;
  status: string;
  open_session_id: number | null;
};

const STYLE: Record<string, string> = {
  tersedia: "bg-card border-brand",
  terisi: "bg-redsoft border-redx",
  dipesan: "bg-ambersoft border-amber",
};
const BADGE: Record<string, string> = {
  tersedia: "bg-brandsoft text-brandd",
  terisi: "bg-redsoft text-redx",
  dipesan: "bg-ambersoft text-amber",
};

export default function DenahMeja() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    apiGet<Table[]>("/tables")
      .then(setTables)
      .finally(() => setLoading(false));
  }, []);

  const onClick = async (t: Table) => {
    if (busy) return;
    if (t.open_session_id) {
      router.push(`/pelayan/menu?session=${t.open_session_id}`);
      return;
    }
    if (t.status === "tersedia") {
      setBusy(true);
      try {
        const s = await apiPost<{ id: number }>("/sessions", {
          dining_table_id: t.id,
          guest_count: t.capacity,
        });
        router.push(`/pelayan/menu?session=${s.id}`);
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <Shell area="pelayan">
      <h1 className="text-lg font-bold">Buka Meja</h1>
      <p className="text-[12.5px] text-sub">
        Pilih meja untuk membuka sesi & mulai mencatat pesanan
      </p>
      <div className="flex gap-5 mt-3 mb-4 text-xs text-sub">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand" />
          Tersedia
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-redx" />
          Terisi
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber" />
          Dipesan
        </span>
      </div>

      {loading ? (
        <p className="text-sub">Memuat…</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {tables.map((t) => {
            const clickable = !!t.open_session_id || t.status === "tersedia";
            return (
              <button
                key={t.id}
                onClick={() => onClick(t)}
                className={`rounded-xl border p-4 text-center ${STYLE[t.status]} ${
                  clickable
                    ? "hover:shadow-md cursor-pointer"
                    : "cursor-default opacity-90"
                }`}
              >
                <div className="text-base font-bold">Meja {t.number}</div>
                <div className="text-xs text-sub mt-0.5">
                  {t.capacity} kursi · {t.area}
                </div>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-bold capitalize ${BADGE[t.status]}`}
                >
                  {t.status}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
