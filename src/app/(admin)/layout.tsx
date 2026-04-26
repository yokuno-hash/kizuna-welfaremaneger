"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, CreditCard, LogOut, Brain, Activity, Building2 } from "lucide-react";
import { logout } from "@/app/actions/auth";

const ADMIN_NAV = [
  { href: "/admin", label: "SaaS管理", icon: ShieldCheck },
  { href: "/facilities", label: "事業所管理", icon: Building2 },
  { href: "/dashboard", label: "施設ダッシュボード", icon: LayoutDashboard },
  { href: "/status", label: "入力状況", icon: Activity },
  { href: "/monitoring", label: "モニタリング評価", icon: Brain },
  { href: "/billing", label: "プラン・課金", icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* サイドナビ */}
      <nav className="w-52 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-4 py-5 border-b border-slate-100">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">管理者専用</p>
          <p className="text-xs text-slate-500 mt-0.5">合同会社絆</p>
        </div>

        <div className="flex-1 p-3 space-y-1">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="px-3 pb-4">
          <form
            action="#"
            onSubmit={async (e) => {
              e.preventDefault();
              await logout();
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <LogOut size={14} />
              ログアウト
            </button>
          </form>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
