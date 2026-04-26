"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Bell,
  Loader2,
  RefreshCw,
} from "lucide-react";

type ClientStatus = {
  name: string;
  lastEntry: string | null;
  daysAgo: number | null;
};

function statusLevel(daysAgo: number | null): "ok" | "warn" | "danger" | "none" {
  if (daysAgo === null) return "none";
  if (daysAgo <= 1) return "ok";
  if (daysAgo <= 3) return "warn";
  return "danger";
}

const STATUS_STYLE = {
  ok:     { badge: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={13} />, label: "記録済み" },
  warn:   { badge: "bg-yellow-100 text-yellow-700",   icon: <AlertTriangle size={13} />, label: "要確認" },
  danger: { badge: "bg-red-100 text-red-700",          icon: <AlertCircle size={13} />,   label: "未記録" },
  none:   { badge: "bg-slate-100 text-slate-500",      icon: <AlertCircle size={13} />,   label: "記録なし" },
};

export default function StatusPage() {
  const supabase = createClient();
  const [statuses, setStatuses] = useState<ClientStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStatuses = useCallback(async (fid: string) => {
    setLoading(true);

    const [{ data: clients }, { data: diaries }] = await Promise.all([
      supabase.from("clients").select("name").eq("facility_id", fid).order("name"),
      supabase.from("diaries")
        .select("client_name, recorded_at")
        .eq("facility_id", fid)
        .order("recorded_at", { ascending: false }),
    ]);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const lastEntryMap: Record<string, string> = {};
    for (const d of diaries ?? []) {
      if (!lastEntryMap[d.client_name]) {
        lastEntryMap[d.client_name] = d.recorded_at;
      }
    }

    const result: ClientStatus[] = (clients ?? []).map((c) => {
      const last = lastEntryMap[c.name] ?? null;
      let daysAgo: number | null = null;
      if (last) {
        const lastDate = new Date(last);
        lastDate.setHours(0, 0, 0, 0);
        daysAgo = Math.round((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      }
      return { name: c.name, lastEntry: last, daysAgo };
    });

    result.sort((a, b) => (b.daysAgo ?? 999) - (a.daysAgo ?? 999));
    setStatuses(result);
    setLastRefresh(new Date());
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles").select("facility_id").eq("id", user.id).single();
      const fid = profile?.facility_id;
      setFacilityId(fid);
      await fetchStatuses(fid);
    };
    init();
  }, [fetchStatuses, supabase]);

  const handleNotify = async () => {
    const unrecorded = statuses.filter((s) => s.daysAgo === null || s.daysAgo >= 3);
    if (unrecorded.length === 0) return;

    setNotifying(true);
    const names = unrecorded.map((s) =>
      `・${s.name}（${s.daysAgo === null ? "記録なし" : `${s.daysAgo}日未記録`}）`
    ).join("\n");

    const body = `以下の利用者の日報記録が滞っています。\n\n${names}\n\n早めにご記録ください。\n記録が不足すると監査時に問題となる場合があります。`;

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: userEmail,
          subject: "【要対応】日報の記録が滞っている利用者がいます",
          body,
        }),
      });
      setNotified(true);
      setTimeout(() => setNotified(false), 5000);
    } catch {
      alert("メール送信に失敗しました");
    } finally {
      setNotifying(false);
    }
  };

  const dangerCount = statuses.filter((s) => statusLevel(s.daysAgo) === "danger" || statusLevel(s.daysAgo) === "none").length;
  const warnCount = statuses.filter((s) => statusLevel(s.daysAgo) === "warn").length;
  const okCount = statuses.filter((s) => statusLevel(s.daysAgo) === "ok").length;

  return (
    <div className="p-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">入力状況モニター</h2>
          <p className="text-sm text-slate-500 mt-1">
            各利用者の日報記録状況をリアルタイムで確認できます
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400">
            最終更新: {lastRefresh.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={() => facilityId && fetchStatuses(facilityId)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-500 mb-1">記録済み（当日）</p>
          <p className="text-3xl font-bold text-emerald-600">{okCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">名</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-500 mb-1">要確認（2〜3日）</p>
          <p className="text-3xl font-bold text-yellow-500">{warnCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">名</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-500 mb-1">未記録（4日以上）</p>
          <p className="text-3xl font-bold text-red-500">{dangerCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">名</p>
        </div>
      </div>

      {/* 通知エリア */}
      {dangerCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-red-700">
              {dangerCount}名の利用者の記録が滞っています
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              監査時に記録不足として指摘される可能性があります
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {notified && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 size={14} />
                メール送信済み
              </span>
            )}
            <button
              onClick={handleNotify}
              disabled={notifying || !userEmail}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 transition-colors"
            >
              {notifying ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
              メールで通知する
            </button>
          </div>
        </div>
      )}

      {/* 利用者ステータス一覧 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700">利用者別 記録状況</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        ) : statuses.length === 0 ? (
          <p className="text-center py-12 text-slate-400 text-sm">
            利用者が登録されていません
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {statuses.map((s) => {
              const level = statusLevel(s.daysAgo);
              const style = STATUS_STYLE[level];
              const lastDate = s.lastEntry
                ? new Date(s.lastEntry).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
                : null;
              return (
                <li key={s.name} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lastDate ? `最終記録: ${lastDate}` : "記録なし"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.daysAgo !== null && (
                      <span className="text-sm font-bold text-slate-600">
                        {s.daysAgo === 0 ? "今日" : `${s.daysAgo}日前`}
                      </span>
                    )}
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
                      {style.icon}
                      {style.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
