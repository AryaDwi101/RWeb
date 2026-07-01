"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

type Table = { id: number; number: string; area: string; capacity: number; status: string };

const badge = (s: string) =>
  s === "terisi"
    ? "bg-redsoft text-redx"
    : s === "dipesan"
      ? "bg-ambersoft text-amber"
      : "bg-brandsoft text-brandd";

const empty = { number: "", area: "", capacity: "4", status: "tersedia" };

export default function Meja() {
  const [tables, setTables] = useState<Table[]>([]);
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const load = () => apiGet<Table[]>("/tables").then(setTables);
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...empty });
    setShow(true);
  };

  const openEdit = (t: Table) => {
    setEditingId(t.id);
    setForm({ number: t.number, area: t.area, capacity: String(t.capacity), status: t.status });
    setShow(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, capacity: parseInt(form.capacity || "1") };
      if (editingId) {
        await apiPut(`/tables/${editingId}`, body);
      } else {
        await apiPost("/tables", body);
      }
      setShow(false);
      setEditingId(null);
      setForm({ ...empty });
      load();
    } finally {
      setSaving(false);
    }
  };

  const del = async (t: Table) => {
    if (!confirm(`Hapus meja "${t.number}"?`)) return;
    await apiDelete(`/tables/${t.id}`);
    load();
  };

  const cols = "grid-cols-[0.6fr_1.4fr_2fr_1fr_1fr_1fr]";

  return (
    <Shell area="admin">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold">Manajemen Meja</h1>
          <p className="text-[12.5px] text-sub">Kelola meja, area, dan kapasitas</p>
        </div>
        <button
          onClick={() => (show ? setShow(false) : openCreate())}
          className="h-10 px-5 rounded-lg bg-brand text-white text-[13px] font-bold"
        >
          {show ? "Tutup" : "+  Tambah Meja"}
        </button>
      </div>

      {show && (
        <div className="bg-card border border-line rounded-xl p-4 mb-4 grid grid-cols-5 gap-3 items-end">
          <Field label="Nomor Meja">
            <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="inp" />
          </Field>
          <Field label="Area">
            <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="inp" />
          </Field>
          <Field label="Kapasitas">
            <input
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              type="number"
              className="inp"
            />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="inp">
              <option value="tersedia">Tersedia</option>
              <option value="terisi">Terisi</option>
              <option value="dipesan">Dipesan</option>
            </select>
          </Field>
          <button
            onClick={save}
            disabled={saving || !form.number}
            className="h-10 px-4 rounded-lg bg-brand text-white text-sm font-bold disabled:opacity-50"
          >
            {editingId ? "Simpan Perubahan" : "Simpan"}
          </button>
        </div>
      )}

      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <div className={`grid ${cols} px-5 py-3 bg-bg text-[11px] font-bold text-sub`}>
          <div>NO</div><div>MEJA</div><div>AREA</div><div>KAPASITAS</div><div>STATUS</div><div>AKSI</div>
        </div>
        {tables.map((t) => (
          <div key={t.id} className={`grid ${cols} px-5 py-3.5 items-center border-t border-line`}>
            <div className="font-bold text-sub">{t.number}</div>
            <div className="font-bold text-[13px]">Meja {t.number}</div>
            <div className="text-[12.5px] text-sub">{t.area}</div>
            <div className="text-[12.5px]">{t.capacity} kursi</div>
            <div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${badge(t.status)}`}>{t.status}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(t)} className="text-xs text-sub border border-line rounded-lg px-2.5 py-1">
                Edit
              </button>
              <button onClick={() => del(t)} className="text-xs text-redx border border-[#f3c2c2] rounded-lg px-2.5 py-1">
                Hapus
              </button>
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
