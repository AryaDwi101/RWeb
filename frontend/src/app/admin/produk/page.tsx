"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { apiGet, apiDelete, apiPost, apiPut, rp } from "@/lib/api";

type Cat = { id: number; name: string };
type Product = {
  id: number;
  name: string;
  price: string;
  stock: number;
  status: string;
  category_id: number | null;
  category: { name: string } | null;
};

const badge = (s: string) =>
  s === "habis"
    ? "bg-redsoft text-redx"
    : s === "menipis"
      ? "bg-ambersoft text-amber"
      : "bg-brandsoft text-brandd";

const empty = { name: "", price: "", stock: "", category_id: "", status: "aktif" };

export default function Produk() {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const load = () => apiGet<Product[]>("/products").then(setItems);
  useEffect(() => {
    load();
    apiGet<Cat[]>("/categories").then(setCats);
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...empty });
    setShow(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      category_id: p.category_id ? String(p.category_id) : "",
      status: p.status,
    });
    setShow(true);
  };

  const del = async (p: Product) => {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    await apiDelete(`/products/${p.id}`);
    load();
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        price: parseFloat(form.price) || 0,
        stock: parseInt(form.stock || "0"),
        category_id: form.category_id ? parseInt(form.category_id) : null,
        status: form.status,
      };
      if (editingId) {
        await apiPut(`/products/${editingId}`, body);
      } else {
        await apiPost("/products", body);
      }
      setForm({ ...empty });
      setEditingId(null);
      setShow(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const cols = "grid-cols-[2fr_1.2fr_1fr_0.8fr_1fr_1fr]";

  return (
    <Shell area="admin">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold">Manajemen Produk</h1>
          <p className="text-[12.5px] text-sub">Kelola item menu, harga, dan stok</p>
        </div>
        <button
          onClick={() => (show ? setShow(false) : openCreate())}
          className="h-10 px-5 rounded-lg bg-brand text-white text-[13px] font-bold"
        >
          {show ? "Tutup" : "+  Tambah Produk"}
        </button>
      </div>

      {show && (
        <div className="bg-card border border-line rounded-xl p-4 mb-4 grid grid-cols-5 gap-3 items-end">
          <Field label="Nama">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="inp" />
          </Field>
          <Field label="Harga">
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" className="inp" />
          </Field>
          <Field label="Stok">
            <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} type="number" className="inp" />
          </Field>
          <Field label="Kategori">
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="inp">
              <option value="">—</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <div className="flex gap-2">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="inp">
              <option value="aktif">Aktif</option>
              <option value="menipis">Menipis</option>
              <option value="habis">Habis</option>
            </select>
            <button onClick={save} disabled={saving || !form.name} className="h-10 px-4 rounded-lg bg-brand text-white text-sm font-bold disabled:opacity-50">
              {editingId ? "Simpan Perubahan" : "Simpan"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <div className={`grid ${cols} px-5 py-3 bg-bg text-[11px] font-bold text-sub`}>
          <div>PRODUK</div><div>KATEGORI</div><div>HARGA</div><div>STOK</div><div>STATUS</div><div>AKSI</div>
        </div>
        {items.map((p) => (
          <div key={p.id} className={`grid ${cols} px-5 py-3.5 items-center border-t border-line`}>
            <div className="font-bold text-[13px]">{p.name}</div>
            <div className="text-[12.5px] text-sub">{p.category?.name ?? "—"}</div>
            <div className="text-[13px] font-bold text-brandd">{rp(p.price)}</div>
            <div className={`text-[12.5px] ${p.stock === 0 ? "text-redx" : ""}`}>{p.stock}</div>
            <div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${badge(p.status)}`}>{p.status}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(p)} className="text-xs text-sub border border-line rounded-lg px-3 py-1.5">Edit</button>
              <button onClick={() => del(p)} className="text-xs text-redx border border-[#f3c2c2] rounded-lg px-3 py-1.5">Hapus</button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .inp {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border: 1px solid var(--color-line);
          border-radius: 8px;
          font-size: 13px;
          outline: none;
        }
      `}</style>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-sub mb-1">{label}</span>
      {children}
    </label>
  );
}
