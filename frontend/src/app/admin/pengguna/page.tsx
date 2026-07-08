"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

type User = { id: number; name: string; email: string; role: string; status: string };

const empty = { name: "", email: "", role: "pelayan", status: "aktif", password: "" };

export default function Pengguna() {
  const [users, setUsers] = useState<User[]>([]);
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => apiGet<User[]>("/users").then(setUsers);
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...empty });
    setError("");
    setShow(true);
  };

  const openEdit = (u: User) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status, password: "" });
    setError("");
    setShow(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const body: Partial<typeof form> = { ...form };
        if (!body.password) delete body.password;
        await apiPut(`/users/${editingId}`, body);
      } else {
        await apiPost("/users", form);
      }
      setShow(false);
      setEditingId(null);
      setForm({ ...empty });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan pengguna.");
    } finally {
      setSaving(false);
    }
  };

  const del = async (u: User) => {
    if (!confirm(`Hapus pengguna "${u.name}"?`)) return;
    await apiDelete(`/users/${u.id}`);
    load();
  };

  const cols = "grid-cols-[2fr_1.4fr_2fr_1fr_1fr]";

  return (
    <Shell area="admin">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold">Manajemen Pengguna</h1>
          <p className="text-[12.5px] text-sub">Kelola akun staf & hak akses peran</p>
        </div>
        <button
          onClick={() => (show ? setShow(false) : openCreate())}
          className="h-10 px-5 rounded-lg bg-brand text-white text-[13px] font-bold"
        >
          {show ? "Tutup" : "+  Tambah Pengguna"}
        </button>
      </div>

      {show && (
        <div className="bg-card border border-line rounded-xl p-4 mb-4 grid grid-cols-5 gap-3 items-end">
          <Field label="Nama">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="inp" />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="inp" />
          </Field>
          <Field label="Peran">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="inp">
              <option value="admin">Admin</option>
              <option value="kasir">Kasir</option>
              <option value="pelayan">Pelayan</option>
              <option value="koki">Koki</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="inp">
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </Field>
          <Field label={editingId ? "Password (kosongkan jika tetap)" : "Password"}>
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type="password"
              className="inp"
            />
          </Field>
          <button
            onClick={save}
            disabled={saving || !form.name || !form.email || (!editingId && !form.password)}
            className="h-10 px-4 rounded-lg bg-brand text-white text-sm font-bold disabled:opacity-50 col-span-5 justify-self-start"
          >
            {editingId ? "Simpan Perubahan" : "Simpan"}
          </button>
          {error && <p className="col-span-5 text-xs text-redx font-medium">{error}</p>}
        </div>
      )}

      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <div className={`grid ${cols} px-5 py-3 bg-bg text-[11px] font-bold text-sub`}>
          <div>NAMA</div><div>PERAN</div><div>KONTAK</div><div>STATUS</div><div>AKSI</div>
        </div>
        {users.map((u) => (
          <div key={u.id} className={`grid ${cols} px-5 py-3.5 items-center border-t border-line`}>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-brandsoft text-brandd font-bold grid place-items-center text-sm">
                {u.name.charAt(0)}
              </span>
              <span className="font-semibold text-[13px]">{u.name}</span>
            </div>
            <div className="text-[12.5px] text-sub capitalize">{u.role}</div>
            <div className="text-[12.5px] text-sub">{u.email}</div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${
                  u.status === "aktif" ? "bg-brandsoft text-brandd" : "bg-redsoft text-redx"
                }`}
              >
                {u.status}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(u)} className="text-xs text-sub border border-line rounded-lg px-2.5 py-1.5">
                Edit
              </button>
              <button onClick={() => del(u)} className="text-xs text-redx border border-[#f3c2c2] rounded-lg px-2.5 py-1.5">
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
