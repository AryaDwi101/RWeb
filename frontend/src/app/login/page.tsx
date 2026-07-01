"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, HOME, Role } from "@/lib/auth";

const ROLES: {
  role: Role;
  email: string;
  label: string;
  desc: string;
  icon: string;
  soft: string;
  tone: string;
}[] = [
  { role: "admin", email: "arya@resto.id", label: "Admin / Manajer", desc: "Kelola data & laporan", icon: "◈", soft: "bg-accentsoft", tone: "text-accent" },
  { role: "kasir", email: "denhanif@resto.id", label: "Kasir", desc: "Pembayaran & struk", icon: "◆", soft: "bg-brandsoft", tone: "text-brandd" },
  { role: "pelayan", email: "rafly@resto.id", label: "Pelayan", desc: "Buka meja & catat pesanan", icon: "☰", soft: "bg-ambersoft", tone: "text-amber" },
  { role: "koki", email: "faiz@resto.id", label: "Koki", desc: "Antrian dapur", icon: "☲", soft: "bg-bg2", tone: "text-ink" },
];

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("arya@resto.id");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(HOME[user.role]);
  }, [ready, user, router]);

  const doLogin = async (em: string) => {
    setError("");
    setLoading(true);
    try {
      const u = await login(em, password);
      router.replace(HOME[u.role]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-[44%] max-w-[520px] bg-side text-white flex-col justify-center px-12 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand grid place-items-center text-3xl font-extrabold">
          P
        </div>
        <h1 className="text-3xl font-extrabold">PoS Dine-In UAD</h1>
        <p className="text-sidetx">Sistem Point-of-Sale Restoran Dine-In</p>
        <ul className="mt-3 space-y-2.5 text-sm">
          {[
            "Pesan bertahap per course",
            "Pembayaran, struk & tutup sesi",
            "Kitchen display real-time",
            "Manajemen menu, meja & pengguna",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand grid place-items-center text-xs">
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-sidetx">
          © 2026 · Resto Nusantara · Tugas RWeb — UAD
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[560px]">
          <h2 className="text-2xl font-extrabold">Selamat datang 👋</h2>
          <p className="text-sub mt-1 mb-5">
            Masuk untuk melanjutkan — lalu pilih peranmu.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              doLogin(email);
            }}
            className="space-y-3"
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="w-full h-12 px-4 rounded-xl bg-card border border-line outline-none focus:border-brand"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full h-12 px-4 rounded-xl bg-card border border-line outline-none focus:border-brand"
            />
            {error && <p className="text-sm text-redx">{error}</p>}
            <button
              disabled={loading}
              type="submit"
              className="w-full h-12 rounded-xl bg-brand text-white font-bold disabled:opacity-60"
            >
              {loading ? "Memproses…" : "Masuk"}
            </button>
          </form>

          <div className="text-center text-xs text-sub my-4">
            — atau masuk cepat sebagai —
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => doLogin(r.email)}
                disabled={loading}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-line hover:border-brand text-left disabled:opacity-60"
              >
                <span
                  className={`w-10 h-10 rounded-[10px] grid place-items-center text-xl ${r.soft} ${r.tone}`}
                >
                  {r.icon}
                </span>
                <span>
                  <span className="block text-[13.5px] font-bold">{r.label}</span>
                  <span className="block text-[11px] text-sub">{r.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-sub mt-4">
            Semua akun demo password: <b>password</b>
          </p>
        </div>
      </div>
    </div>
  );
}
