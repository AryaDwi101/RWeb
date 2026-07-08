"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

type Cat = { id: number; name: string; color: string | null; products_count: number };

const empty = { name: "", color: "#16a34a" };

export default function Kategori() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => apiGet<Cat[]>("/categories").then(setCats);
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...empty });
    setError("");
    setShow(true);
  };

  const openEdit = (c: Cat) => {
    setEditingId(c.id);
    setForm({ name: c.name, color: c.color ?? "#16a34a" });
    setError("");
    setShow(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await apiPut(`/categories/${editingId}`, form);
      } else {
        await apiPost("/categories", form);
      }
      setShow(false);
      setEditingId(null);
      setForm({ ...empty });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan kategori.");
    } finally {
      setSaving(false);
    }
  };

  const del = async (c: Cat) => {
    if (!confirm(`Hapus kategori "${c.name}"?`)) return;
    try {
      await apiDelete(`/categories/${c.id}`);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus kategori.");
    }
  };

  return (
    <Shell area="admin">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold">Kategori Menu</h1>
          <p className="text-[12.5px] text-sub">Pengelompokan menu untuk kasir & pelayan</p>
        </div>
        <button
          onClick={() => (show ? setShow(false) : openCreate())}
          className="h-10 px-5 rounded-lg bg-brand text-white text-[13px] font-bold"
        >
          {show ? "Tutup" : "+  Tambah Kategori"}
        </button>
      </div>

      {show && (
        <div className="bg-card border border-line rounded-xl p-4 mb-4">
          <div className="flex gap-3 items-end">
            <Field label="Nama">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="inp" />
            </Field>
            <Field label="Warna">
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                type="color"
                className="inp h-10 w-16 p-1"
              />
            </Field>
            <button
              onClick={save}
              disabled={saving || !form.name}
              className="h-10 px-4 rounded-lg bg-brand text-white text-sm font-bold disabled:opacity-50"
            >
              {editingId ? "Simpan Perubahan" : "Simpan"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-redx font-medium">{error}</p>}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {cats.map((c) => (
          <div key={c.id} className="bg-card border border-line rounded-xl p-5">
            <div className="flex justify-between items-start">
              <div
                className="w-12 h-12 rounded-xl grid place-items-center text-xl font-bold mb-3"
                style={{ background: (c.color ?? "#16a34a") + "22", color: c.color ?? "#16a34a" }}
              >
                ▦
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="text-xs text-sub border border-line rounded-lg px-2.5 py-1">
                  Edit
                </button>
                <button onClick={() => del(c)} className="text-xs text-redx border border-[#f3c2c2] rounded-lg px-2.5 py-1">
                  Hapus
                </button>
              </div>
            </div>
            <div className="font-bold">{c.name}</div>
            <div className="text-[12.5px] text-sub mt-0.5">{c.products_count} item</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .inp {
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
