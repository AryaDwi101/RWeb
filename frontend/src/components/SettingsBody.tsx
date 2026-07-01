"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";

function Toggle({ on }: { on: boolean }) {
  const [v, setV] = useState(on);
  return (
    <button
      onClick={() => setV(!v)}
      className={`w-[38px] h-[22px] rounded-full relative transition-colors ${v ? "bg-brand" : "bg-[#cbd5e1]"}`}
    >
      <span
        className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all ${v ? "left-[18px]" : "left-0.5"}`}
      />
    </button>
  );
}

export default function SettingsBody() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-lg font-bold">Pengaturan</h1>
      <p className="text-[12.5px] text-sub mb-4">Preferensi akun & aplikasi</p>

      <div className="bg-card border border-line rounded-xl p-5 flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-brandsoft text-brandd text-xl font-bold grid place-items-center">
          {user?.name.charAt(0)}
        </div>
        <div>
          <div className="font-bold">
            {user?.name} — <span className="capitalize">{user?.role}</span>
          </div>
          <div className="text-[12.5px] text-sub">{user?.email}</div>
        </div>
      </div>

      <div className="bg-card border border-line rounded-xl divide-y divide-line">
        <Row label="Bahasa" value="Indonesia" />
        <Row label="Notifikasi Pesanan" toggle on />
        <Row label="Suara Notifikasi" toggle on />
        <Row label="Bantuan & FAQ" value="›" />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  toggle,
  on,
}: {
  label: string;
  value?: string;
  toggle?: boolean;
  on?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-[13.5px] font-medium">{label}</span>
      {toggle ? <Toggle on={!!on} /> : <span className="text-[12.5px] text-sub">{value}</span>}
    </div>
  );
}
