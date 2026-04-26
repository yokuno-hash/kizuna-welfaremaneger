"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Trash2, Loader2, CheckCircle2, Users } from "lucide-react";

type Client = {
  id: string;
  name: string;
  created_at: string;
};

export default function ClientsPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: true });
    setClients(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      // facility_id を profiles から取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未ログイン");

      const { data: profile } = await supabase
        .from("profiles")
        .select("facility_id")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("clients").insert({
        name,
        facility_id: profile?.facility_id,
      });
      if (error) throw error;

      setNewName("");
      showToast(`「${name}」を追加しました`);
      await fetchClients();
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
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      showToast(`「${name}」を削除しました`);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch {
      showToast("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 space-y-8 relative">
      {/* トースト */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-800 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Users size={22} className="text-blue-500" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">利用者管理</h2>
          <p className="text-sm text-slate-500 mt-0.5">日報に表示される利用者を追加・削除できます</p>
        </div>
      </div>

      {/* 追加フォーム */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">利用者を追加</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="例：山田 太郎"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
              adding || !newName.trim()
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {adding ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <UserPlus size={15} />
            )}
            追加
          </button>
        </div>
      </div>

      {/* 利用者一覧 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">登録済み利用者</h3>
          <span className="text-xs text-slate-400">{clients.length}名</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            利用者が登録されていません
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {clients.map((client) => (
              <li
                key={client.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {client.name[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-800">{client.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(client.id, client.name)}
                  disabled={deletingId === client.id}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  {deletingId === client.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
