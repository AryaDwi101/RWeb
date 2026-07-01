"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, HOME, Role } from "@/lib/auth";

type NavItem = { label: string; href: string; icon: string };

const NAV: Record<Role, { label: string; items: NavItem[] }> = {
  pelayan: {
    label: "Pelayan",
    items: [
      { label: "Denah Meja", href: "/pelayan", icon: "▦" },
      { label: "Menu", href: "/pelayan/menu", icon: "☰" },
      { label: "Pengaturan", href: "/pelayan/pengaturan", icon: "⚙" },
    ],
  },
  kasir: {
    label: "Kasir",
    items: [
      { label: "Tagihan", href: "/kasir", icon: "▤" },
      { label: "Pengaturan", href: "/kasir/pengaturan", icon: "⚙" },
    ],
  },
  koki: {
    label: "Koki",
    items: [
      { label: "Antrian", href: "/koki", icon: "☲" },
      { label: "Pengaturan", href: "/koki/pengaturan", icon: "⚙" },
    ],
  },
  admin: {
    label: "Admin / Manajer",
    items: [
      { label: "Laporan", href: "/admin", icon: "◈" },
      { label: "Produk", href: "/admin/produk", icon: "▣" },
      { label: "Kategori", href: "/admin/kategori", icon: "▤" },
      { label: "Meja", href: "/admin/meja", icon: "▦" },
      { label: "Pengguna", href: "/admin/pengguna", icon: "◔" },
    ],
  },
};

export default function Shell({
  area,
  children,
}: {
  area: Role;
  children: ReactNode;
}) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== area) {
      router.replace(HOME[user.role]);
    }
  }, [ready, user, area, router]);

  if (!ready || !user || user.role !== area) {
    return <div className="p-8 text-sub">Memuat…</div>;
  }

  const nav = NAV[area];
  const home = "/" + area;
  const isActive = (href: string) =>
    href === home ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-[92px] shrink-0 bg-side flex flex-col items-center pt-7 gap-1.5">
        <div className="w-9 h-9 rounded-xl bg-brand text-white font-extrabold grid place-items-center mb-6">
          P
        </div>
        {nav.items.map((it) => {
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`w-[72px] py-2.5 rounded-xl flex flex-col items-center gap-1 ${
                active ? "bg-brand text-white" : "text-sidetx"
              }`}
            >
              <span className="text-xl leading-none">{it.icon}</span>
              <span className="text-[9.5px]">{it.label}</span>
            </Link>
          );
        })}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-card border-b border-line flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" />
            <span className="font-bold">Resto Nusantara</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brandsoft text-brandd font-bold grid place-items-center">
              {user.name.charAt(0)}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold">{user.name.split(" ")[0]}</div>
              <div className="text-[10px] text-sub">{nav.label}</div>
            </div>
            <button
              onClick={() => logout().then(() => router.replace("/login"))}
              className="ml-2 text-xs text-sub border border-line rounded-lg px-3 py-1.5 hover:bg-bg2"
            >
              Keluar
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
