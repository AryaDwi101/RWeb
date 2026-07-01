"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, HOME } from "@/lib/auth";

export default function Home() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(user ? HOME[user.role] : "/login");
  }, [ready, user, router]);

  return <div className="p-8 text-sub">Memuat…</div>;
}
