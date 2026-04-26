// ============================================================
// モックデータ（ダミーデータ）
// 本番移行時はこのファイルを API クライアントに置き換えてください
// ============================================================

export type NavItem = {
  label: string;
  href: string;
  icon: string; // Lucide アイコン名
};

export const navItems: NavItem[] = [
  { label: "ダッシュボード", href: "/", icon: "LayoutDashboard" },
  { label: "日報入力", href: "/diary", icon: "ScrollText" },
  { label: "施設管理ダッシュボード", href: "/dashboard", icon: "Building2" },
  { label: "eラーニング（既存）", href: "/elearning", icon: "BookOpen" },
  { label: "eラーニング（新規）", href: "/e-learning", icon: "Sparkles" },
  { label: "書類保管庫", href: "/documents", icon: "FolderOpen" },
  { label: "SaaS管理画面", href: "/admin", icon: "ShieldCheck" },
];

// ---- ダッシュボード ----

export type TaskStatus = "未着手" | "進行中" | "完了";

export type Task = {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: TaskStatus;
  priority: "高" | "中" | "低";
};

export const tasks: Task[] = [
  {
    id: "t001",
    title: "サービス利用計画の更新",
    assignee: "田中 花子",
    dueDate: "2026-04-10",
    status: "進行中",
    priority: "高",
  },
  {
    id: "t002",
    title: "モニタリング報告書の提出",
    assignee: "佐藤 一郎",
    dueDate: "2026-04-15",
    status: "未着手",
    priority: "高",
  },
  {
    id: "t003",
    title: "個別支援計画の見直し",
    assignee: "鈴木 美咲",
    dueDate: "2026-04-20",
    status: "未着手",
    priority: "中",
  },
  {
    id: "t004",
    title: "利用者アセスメント実施",
    assignee: "田中 花子",
    dueDate: "2026-03-31",
    status: "完了",
    priority: "中",
  },
  {
    id: "t005",
    title: "スタッフ研修記録の整理",
    assignee: "山田 太郎",
    dueDate: "2026-04-30",
    status: "未着手",
    priority: "低",
  },
];

export type StatCard = {
  label: string;
  value: string | number;
  sub: string;
  color: "blue" | "yellow" | "green" | "red";
};

export const statCards: StatCard[] = [
  { label: "今月のタスク総数", value: 24, sub: "前月比 +3", color: "blue" },
  { label: "期限超過", value: 2, sub: "要対応", color: "red" },
  { label: "完了率", value: "67%", sub: "今月", color: "green" },
  { label: "担当者数", value: 8, sub: "アクティブ", color: "yellow" },
];

// ---- eラーニング ----

export type Course = {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number; // 0–100
  thumbnail: string; // 絵文字で代替
};

export const courses: Course[] = [
  {
    id: "c001",
    title: "障害福祉サービスの基礎知識",
    category: "基礎研修",
    duration: "60分",
    progress: 100,
    thumbnail: "📚",
  },
  {
    id: "c002",
    title: "個別支援計画の作成実践",
    category: "スキルアップ",
    duration: "90分",
    progress: 45,
    thumbnail: "📝",
  },
  {
    id: "c003",
    title: "虐待防止・権利擁護",
    category: "必須研修",
    duration: "120分",
    progress: 0,
    thumbnail: "🛡️",
  },
  {
    id: "c004",
    title: "感染症対策マニュアル",
    category: "必須研修",
    duration: "45分",
    progress: 80,
    thumbnail: "🏥",
  },
  {
    id: "c005",
    title: "コミュニケーション技術",
    category: "スキルアップ",
    duration: "75分",
    progress: 0,
    thumbnail: "💬",
  },
];

// ---- 施設管理ダッシュボード ----

export type LineNotificationType = "info" | "warning" | "urgent";

export type LineNotification = {
  id: string;
  type: LineNotificationType;
  title: string;
  body: string;
  sentAt: string; // ISO date string
};

export const lineNotifications: LineNotification[] = [
  {
    id: "n001",
    type: "info",
    title: "【新着】令和8年度 障害福祉サービス等報酬改定のご案内",
    body: "厚生労働省より報酬改定の詳細が公表されました。4月10日までに内容をご確認ください。",
    sentAt: "2026-04-02T09:00:00",
  },
  {
    id: "n002",
    type: "warning",
    title: "【警告】モニタリング報告書の提出期限が迫っています",
    body: "提出期限まで残り13日です。佐藤 一郎 担当分が未提出です。早急にご対応ください。",
    sentAt: "2026-04-02T08:30:00",
  },
  {
    id: "n003",
    type: "urgent",
    title: "【緊急】運営指導の事前通知が届きました",
    body: "4月25日（土）に実地指導が予定されています。関連書類の準備を開始してください。",
    sentAt: "2026-04-01T17:15:00",
  },
  {
    id: "n004",
    type: "info",
    title: "【新着】○○市 介護報酬加算に関する補助金のご案内",
    body: "申請期限：2026年5月31日。対象事業所は市HPよりダウンロードの上、担当窓口へ提出してください。",
    sentAt: "2026-03-31T10:00:00",
  },
  {
    id: "n005",
    type: "warning",
    title: "【警告】スタッフ研修の未受講者がいます",
    body: "必須研修「虐待防止・権利擁護」の未受講者が3名います。期限は4月30日です。",
    sentAt: "2026-03-30T09:00:00",
  },
];

export type AdminTask = {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  daysLeft: number; // 残日数（負数 = 超過）
  completed: boolean;
};

// 行政指導対応タスク（再来週以降に項目・期限条件を変更しやすいよう配列で管理）
export const adminTasks: AdminTask[] = [
  {
    id: "at001",
    title: "サービス提供実績記録の整備",
    category: "書類整備",
    dueDate: "2026-04-05",
    daysLeft: 3,
    completed: true,
  },
  {
    id: "at002",
    title: "運営規程の最新版確認・掲示",
    category: "運営管理",
    dueDate: "2026-04-10",
    daysLeft: 8,
    completed: true,
  },
  {
    id: "at003",
    title: "個人情報保護方針の利用者周知",
    category: "書類整備",
    dueDate: "2026-04-12",
    daysLeft: 10,
    completed: false,
  },
  {
    id: "at004",
    title: "身体拘束廃止に関する取り組み記録",
    category: "記録管理",
    dueDate: "2026-04-15",
    daysLeft: 13,
    completed: false,
  },
  {
    id: "at005",
    title: "苦情対応マニュアルの更新",
    category: "運営管理",
    dueDate: "2026-04-18",
    daysLeft: 16,
    completed: false,
  },
  {
    id: "at006",
    title: "事故報告書の様式確認・備付け",
    category: "記録管理",
    dueDate: "2026-04-20",
    daysLeft: 18,
    completed: true,
  },
  {
    id: "at007",
    title: "スタッフ資格証明書のコピー収集",
    category: "人事・労務",
    dueDate: "2026-04-22",
    daysLeft: 20,
    completed: false,
  },
  {
    id: "at008",
    title: "勤務形態一覧表の作成",
    category: "人事・労務",
    dueDate: "2026-04-23",
    daysLeft: 21,
    completed: false,
  },
  {
    id: "at009",
    title: "利用者ファイルの内容点検",
    category: "書類整備",
    dueDate: "2026-04-24",
    daysLeft: 22,
    completed: false,
  },
  {
    id: "at010",
    title: "当日対応リストの最終確認",
    category: "当日準備",
    dueDate: "2026-04-25",
    daysLeft: 23,
    completed: false,
  },
];

// ---- 新規施設向け eラーニング ----

export type LearningStep = {
  id: string;
  step: number;
  title: string;
  emoji: string;
  color: string;        // Tailwind bg color（アイコン背景）
  ringColor: string;    // Tailwind ring color（ステップ番号）
  duration: string;
  summary: string;
  details: string[];    // アコーディオン内の詳細リスト
};

export const learningSteps: LearningStep[] = [
  {
    id: "ls001",
    step: 1,
    title: "初期設定",
    emoji: "⚙️",
    color: "bg-violet-100",
    ringColor: "bg-violet-500",
    duration: "約15分",
    summary:
      "システムへのログインから基本情報の入力まで、最初に必要な設定をステップごとに確認します。",
    details: [
      "① 管理者アカウントでログインし、パスワードを変更してください。",
      "② 事業所名・所在地・連絡先などの基本情報を「事業所設定」から入力します。",
      "③ スタッフのアカウントを作成し、役割（管理者 / 一般）を設定します。",
      "④ 通知メールアドレスと LINEアカウントを連携します（任意）。",
      "⑤ 設定内容を保存し、ダッシュボードが表示されれば完了です！",
    ],
  },
  {
    id: "ls002",
    step: 2,
    title: "アセスメントシートの作り方",
    emoji: "📋",
    color: "bg-sky-100",
    ringColor: "bg-sky-500",
    duration: "約30分",
    summary:
      "利用者のニーズを正確に把握するためのアセスメントシートの書き方と、システムへの入力方法を学びます。",
    details: [
      "① アセスメントシートとは、利用者の生活状況・ニーズ・意向を記録する書類です。",
      "② 「利用者管理」メニューから対象者を選択し、「新規アセスメント」をクリックします。",
      "③ 基本情報・生活歴・現在の状況・本人の希望を順番に入力します。",
      "④ 入力後は担当者・管理者の承認フローを経て確定となります。",
      "⑤ 作成したシートは PDF で出力して、ファイルに綴じることができます。",
      "⑥ 6ヶ月ごとの見直しリマインダーが自動で設定されます。",
    ],
  },
  {
    id: "ls003",
    step: 3,
    title: "外部研修動画を見る",
    emoji: "🎬",
    color: "bg-pink-100",
    ringColor: "bg-pink-500",
    duration: "約60分",
    summary:
      "厚生労働省・都道府県が提供する公式研修動画を視聴し、サービス提供の基礎を理解します。",
    details: [
      "① 「eラーニング」メニューから「外部研修」タブを開きます。",
      "② 「障害福祉サービスの基礎」（約30分）を視聴してください。",
      "③ 視聴後にミニテスト（5問）に回答すると修了証が発行されます。",
      "④ 修了証は「書類保管庫」に自動保存されます。印刷も可能です。",
      "⑤ 残りの推奨動画（権利擁護・虐待防止）もできるだけ早めに受講しましょう。",
    ],
  },
];

// ---- 書類保管庫 ----

export type Document = {
  id: string;
  name: string;
  category: string;
  updatedAt: string;
  size: string;
  icon: string; // 絵文字
};

export const documents: Document[] = [
  {
    id: "d001",
    name: "サービス利用計画書_田中花子_2026.pdf",
    category: "利用計画",
    updatedAt: "2026-04-01",
    size: "245 KB",
    icon: "📄",
  },
  {
    id: "d002",
    name: "モニタリング報告書_2026Q1.pdf",
    category: "報告書",
    updatedAt: "2026-03-31",
    size: "312 KB",
    icon: "📊",
  },
  {
    id: "d003",
    name: "スタッフ研修記録_2026年度.xlsx",
    category: "研修記録",
    updatedAt: "2026-03-28",
    size: "88 KB",
    icon: "📋",
  },
  {
    id: "d004",
    name: "事業所自己評価_2025年度.docx",
    category: "評価書類",
    updatedAt: "2026-02-15",
    size: "156 KB",
    icon: "📝",
  },
  {
    id: "d005",
    name: "重要事項説明書（改訂版）.pdf",
    category: "契約書類",
    updatedAt: "2026-01-10",
    size: "420 KB",
    icon: "📃",
  },
];

// ---- SaaS管理画面（全施設一覧） ----

export type AlertLevel = "none" | "warning" | "critical";

export type Facility = {
  id: string;
  name: string;
  plan: string;
  taskCompletionRate: number; // 0–100
  lastLoginDate: string;      // ISO date
  overdueCount: number;       // 期限超過タスク数
  alertLevel: AlertLevel;
  alertNote: string;          // アラートの説明文
};

// ⚠️ alertLevel の判定基準（再来週以降に変更可）
//   critical : 完了率 < 40% または 期限超過 ≥ 2
//   warning  : 完了率 < 70% または 期限超過 = 1
//   none     : それ以外

export const facilities: Facility[] = [
  {
    id: "f001",
    name: "事業所A（さくら福祉センター）",
    plan: "スタンダード",
    taskCompletionRate: 82,
    lastLoginDate: "2026-04-02",
    overdueCount: 0,
    alertLevel: "none",
    alertNote: "—",
  },
  {
    id: "f002",
    name: "事業所B（ひまわり支援センター）",
    plan: "プレミアム",
    taskCompletionRate: 55,
    lastLoginDate: "2026-04-01",
    overdueCount: 1,
    alertLevel: "warning",
    alertNote: "完了率低下・期限超過1件",
  },
  {
    id: "f003",
    name: "事業所C（みどり作業所）",
    plan: "スタンダード",
    taskCompletionRate: 30,
    lastLoginDate: "2026-03-25",
    overdueCount: 3,
    alertLevel: "critical",
    alertNote: "完了率危機的・超過3件・長期未ログイン",
  },
  {
    id: "f004",
    name: "事業所D（あおぞら生活介護）",
    plan: "スタンダード",
    taskCompletionRate: 91,
    lastLoginDate: "2026-04-02",
    overdueCount: 0,
    alertLevel: "none",
    alertNote: "—",
  },
  {
    id: "f005",
    name: "事業所E（のぞみ就労支援）",
    plan: "プレミアム",
    taskCompletionRate: 63,
    lastLoginDate: "2026-03-30",
    overdueCount: 1,
    alertLevel: "warning",
    alertNote: "期限超過1件・要フォロー",
  },
  {
    id: "f006",
    name: "事業所F（つばさ放課後デイ）",
    plan: "ライト",
    taskCompletionRate: 20,
    lastLoginDate: "2026-03-10",
    overdueCount: 4,
    alertLevel: "critical",
    alertNote: "完了率危機的・超過4件・3週間以上未ログイン",
  },
  {
    id: "f007",
    name: "事業所G（やまびこホーム）",
    plan: "スタンダード",
    taskCompletionRate: 78,
    lastLoginDate: "2026-04-01",
    overdueCount: 0,
    alertLevel: "none",
    alertNote: "—",
  },
  {
    id: "f008",
    name: "事業所H（こもれびケア）",
    plan: "ライト",
    taskCompletionRate: 45,
    lastLoginDate: "2026-03-28",
    overdueCount: 2,
    alertLevel: "critical",
    alertNote: "完了率低下・期限超過2件",
  },
];
