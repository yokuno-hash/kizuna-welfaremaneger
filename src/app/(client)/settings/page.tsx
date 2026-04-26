"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  UserPlus,
  Trash2,
  Loader2,
  CheckCircle2,
  ClipboardList,
  Settings,
} from "lucide-react";

type Tab = "clients" | "staff";

type Client = { id: string; name: string };
type Staff = { id: string; name: string; role: "work" | "life" };

const ROLE_LABEL: Record<"work" | "life", string> = {
  work: "職業指導員",
  life: "生活支援員",
};

export default function SettingsPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("clients");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── 施設ID取得 ──────────────────────────
  const [facilityId, setFacilityId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("facility_id")
        .eq("id", user.id)
        .single();
      setFacilityId(profile?.facility_id ?? null);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6 relative">
      {/* トースト */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-800 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Settings size={20} className="text-blue-500" />
        <div>
          <h2 className="text-xl font-bold text-slate-800">設定</h2>
          <p className="text-xs text-slate-500 mt-0.5">利用者・指導員を管理します</p>
        </div>
      </div>

      {/* タブ */}
      <div className="flex gap-2">
        <TabBtn active={tab === "clients"} onClick={() => setTab("clients")} icon={<Users size={14} />}>
          利用者
        </TabBtn>
        <TabBtn active={tab === "staff"} onClick={() => setTab("staff")} icon={<ClipboardList size={14} />}>
          指導員
        </TabBtn>
      </div>

      {facilityId === null ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-slate-300" />
        </div>
      ) : tab === "clients" ? (
        <ClientsTab facilityId={facilityId} showToast={showToast} />
      ) : (
        <StaffTab facilityId={facilityId} showToast={showToast} />
      )}
    </div>
  );
}

// ── タブボタン ───────────────────────────

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// ── 利用者タブ ───────────────────────────

function ClientsTab({ facilityId, showToast }: { facilityId: string; showToast: (msg: string) => void }) {
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, name")
      .eq("facility_id", facilityId)
      .order("name", { ascending: true });
    setClients(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      const { error } = await supabase.from("clients").insert({ name, facility_id: facilityId });
      if (error) throw error;
      setNewName("");
      showToast(`「${name}」を追加しました`);
      await fetchClients();
    } catch (e: unknown) {
      const msg = typeof e === "object" && e !== null && "message" in e ? String((e as { message: unknown }).message) : String(e);
      showToast(`追加失敗: ${msg}`);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      showToast(`「${name}」を削除しました`);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(`削除失敗: ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  return <ManagedList
    label="利用者"
    items={clients}
    loading={loading}
    newName={newName}
    setNewName={setNewName}
    adding={adding}
    onAdd={handleAdd}
    deletingId={deletingId}
    onDelete={handleDelete}
    placeholder="例：山田 太郎"
    badge={(item) => null}
  />;
}

// ── 指導員タブ ───────────────────────────

function StaffTab({ facilityId, showToast }: { facilityId: string; showToast: (msg: string) => void }) {
  const supabase = createClient();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"work" | "life">("work");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetch = async () => {
    const { data } = await supabase
      .from("staff")
      .select("id, name, role")
      .eq("facility_id", facilityId)
      .order("name", { ascending: true });
    setStaff((data as Staff[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      const { error } = await supabase.from("staff").insert({ name, role: newRole, facility_id: facilityId });
      if (error) throw error;
      setNewName("");
      showToast(`「${name}」を追加しました`);
      await fetch();
    } catch {
      showToast("追加に失敗しました");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("staff").delete().eq("id", id);
      if (error) throw error;
      showToast(`「${name}」を削除しました`);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch {
      showToast("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 追加フォーム */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">指導員を追加</h3>
        {/* 役職選択 */}
        <div className="flex gap-2 mb-3">
          {(["work", "life"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setNewRole(r)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                newRole === r
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-white border-slate-200 text-slate-500"
              }`}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="例：田中 花子"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
              adding || !newName.trim() ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {adding ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            追加
          </button>
        </div>
      </div>

      {/* 一覧 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">登録済み指導員</h3>
          <span className="text-xs text-slate-400">{staff.length}名</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin text-slate-300" />
          </div>
        ) : staff.length === 0 ? (
          <p className="text-center py-10 text-slate-400 text-sm">指導員が登録されていません</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {staff.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{ROLE_LABEL[s.role]}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  disabled={deletingId === s.id}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  {deletingId === s.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── 共通リストUI（利用者用） ─────────────

function ManagedList({
  label,
  items,
  loading,
  newName,
  setNewName,
  adding,
  onAdd,
  deletingId,
  onDelete,
  placeholder,
  badge,
}: {
  label: string;
  items: { id: string; name: string }[];
  loading: boolean;
  newName: string;
  setNewName: (v: string) => void;
  adding: boolean;
  onAdd: () => void;
  deletingId: string | null;
  onDelete: (id: string, name: string) => void;
  placeholder: string;
  badge: (item: { id: string; name: string }) => React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">{label}を追加</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            placeholder={placeholder}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={onAdd}
            disabled={adding || !newName.trim()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
              adding || !newName.trim() ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {adding ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            追加
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">登録済み{label}</h3>
          <span className="text-xs text-slate-400">{items.length}名</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin text-slate-300" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center py-10 text-slate-400 text-sm">{label}が登録されていません</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {item.name[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{item.name}</span>
                    {badge(item)}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(item.id, item.name)}
                  disabled={deletingId === item.id}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
