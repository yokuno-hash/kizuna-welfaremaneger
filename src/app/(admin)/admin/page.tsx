"use client";

import { useState } from "react";
import { facilities, type AlertLevel } from "@/data/mock";
import { BellRing, AlertTriangle, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";

// ---- アラートレベルごとのスタイル定義 ----

const alertStyles: Record<
  AlertLevel,
  { row: string; badge: string; icon: React.ReactNode; label: string }
> = {
  none: {
    row: "",
    badge: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle2 size={14} className="inline-block mr-1 -mt-0.5" />,
    label: "正常",
  },
  warning: {
    row: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-700",
    icon: <AlertTriangle size={14} className="inline-block mr-1 -mt-0.5" />,
    label: "要注意",
  },
  critical: {
    row: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    icon: <ShieldAlert size={14} className="inline-block mr-1 -mt-0.5" />,
    label: "要対応",
  },
};

// ---- 完了率バー ----

function CompletionBar({ rate }: { rate: number }) {
  const color =
    rate < 40 ? "bg-red-500" : rate < 70 ? "bg-yellow-400" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 bg-slate-100 rounded-full h-2 flex-shrink-0">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span
        className={`text-sm font-semibold ${
          rate < 40
            ? "text-red-600"
            : rate < 70
              ? "text-yellow-600"
              : "text-emerald-600"
        }`}
      >
        {rate}%
      </span>
    </div>
  );
}

// ---- サマリーカード ----

function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <div className={`bg-white rounded-xl p-4 border-l-4 shadow-sm ${color}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-800 mt-0.5">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

// ---- ページ本体 ----

export default function AdminPage() {
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  const handleNotifyAll = async () => {
    setNotifying(true);
    try {
      await fetch("/api/send-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "broadcast",
          message: "【運営指導サポート】未完了タスクがあります。期限内に対応をお願いします。",
        }),
      });
      setNotified(true);
      setTimeout(() => setNotified(false), 4000);
    } catch {
      alert("LINE通知の送信に失敗しました");
    } finally {
      setNotifying(false);
    }
  };

  const total = facilities.length;
  const criticalCount = facilities.filter((f) => f.alertLevel === "critical").length;
  const warningCount = facilities.filter((f) => f.alertLevel === "warning").length;
  const needsNotify = facilities.filter((f) => f.alertLevel !== "none").length;

  return (
    <div className="p-8 space-y-8">
      {/* ページタイトル */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">SaaS管理画面</h2>
        <p className="text-sm text-slate-500 mt-1">
          契約中の全事業所のタスク状況・アラートを一元管理します
        </p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="契約事業所数"
          value={total}
          sub="稼働中"
          color="border-blue-400"
        />
        <SummaryCard
          label="要対応（危機的）"
          value={criticalCount}
          sub="即時フォロー推奨"
          color="border-red-400"
        />
        <SummaryCard
          label="要注意"
          value={warningCount}
          sub="経過観察"
          color="border-yellow-400"
        />
        <SummaryCard
          label="通知対象施設"
          value={needsNotify}
          sub="未完了あり"
          color="border-violet-400"
        />
      </div>

      {/* アクションエリア */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{needsNotify}施設</span>
          にアラートが発生しています
        </p>

        <div className="flex items-center gap-3">
          {notified && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 size={14} />
              LINE通知を送信しました
            </span>
          )}
          <button
            onClick={handleNotifyAll}
            disabled={notifying}
            className={`flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow transition-all ${notifying ? "opacity-60 cursor-wait" : ""}`}
          >
            {notifying ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
            未完了施設に通知を送る
          </button>
        </div>
      </div>

      {/* 施設一覧テーブル */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 text-left">事業所名</th>
              <th className="px-6 py-3 text-left">プラン</th>
              <th className="px-6 py-3 text-left">タスク完了率</th>
              <th className="px-6 py-3 text-left">最終ログイン</th>
              <th className="px-6 py-3 text-left">アラート状況</th>
              <th className="px-6 py-3 text-left">詳細</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {facilities.map((facility) => {
              const style = alertStyles[facility.alertLevel];
              return (
                <tr
                  key={facility.id}
                  className={`transition-colors hover:brightness-95 ${style.row}`}
                >
                  {/* 事業所名 */}
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {facility.name}
                  </td>

                  {/* プラン */}
                  <td className="px-6 py-4 text-slate-500">{facility.plan}</td>

                  {/* タスク完了率 */}
                  <td className="px-6 py-4">
                    <CompletionBar rate={facility.taskCompletionRate} />
                  </td>

                  {/* 最終ログイン */}
                  <td className="px-6 py-4 text-slate-600">
                    {facility.lastLoginDate}
                  </td>

                  {/* アラート */}
                  <td className="px-6 py-4">
                    <div>
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}
                      >
                        {style.icon}
                        {style.label}
                        {facility.overdueCount > 0 &&
                          `（超過${facility.overdueCount}件）`}
                      </span>
                      {facility.alertNote !== "—" && (
                        <p className="text-xs text-slate-400 mt-1 leading-snug">
                          {facility.alertNote}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* 詳細リンク（ダミー） */}
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline text-xs font-medium whitespace-nowrap">
                      詳細を見る
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-50 border border-red-200 inline-block" />
          要対応：完了率 &lt; 40% または期限超過 ≥ 2件
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-yellow-50 border border-yellow-200 inline-block" />
          要注意：完了率 &lt; 70% または期限超過 1件
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-white border border-slate-200 inline-block" />
          正常
        </span>
      </div>
    </div>
  );
}
