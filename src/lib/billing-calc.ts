export type AttendanceRow = {
  client_name: string;
  attendance: string;
  lunch: string;
  transport: string;
};

export type ClientBillingSummary = {
  clientName: string;
  attendance: number;
  lunch: number;
  transportBoth: number;
  transportOne: number;
};

export function calcBilling(rows: AttendanceRow[]): ClientBillingSummary[] {
  const acc: Record<string, ClientBillingSummary> = {};

  for (const row of rows) {
    if (!acc[row.client_name]) {
      acc[row.client_name] = {
        clientName: row.client_name,
        attendance: 0,
        lunch: 0,
        transportBoth: 0,
        transportOne: 0,
      };
    }
    const s = acc[row.client_name];
    if (row.attendance !== "●") s.attendance++;
    if (row.lunch === "○") s.lunch++;
    if (row.transport === "○") s.transportBoth++;
    if (row.transport === "△") s.transportOne++;
  }

  return Object.values(acc).sort((a, b) => a.clientName.localeCompare(b.clientName, "ja"));
}

export function exportBillingCSV(
  summaries: ClientBillingSummary[],
  year: number,
  month: number,
  facilityName: string
): string {
  const header = [
    "利用者名",
    "出席日数",
    "食事提供加算",
    "送迎加算（往復）",
    "送迎加算（片道）",
  ];

  const rows = summaries.map((s) => [
    s.clientName,
    s.attendance,
    s.lunch,
    s.transportBoth,
    s.transportOne,
  ]);

  const totals = [
    "合計",
    summaries.reduce((n, s) => n + s.attendance, 0),
    summaries.reduce((n, s) => n + s.lunch, 0),
    summaries.reduce((n, s) => n + s.transportBoth, 0),
    summaries.reduce((n, s) => n + s.transportOne, 0),
  ];

  const meta = [
    `事業所名,${facilityName}`,
    `集計月,${year}年${month}月`,
    `出力日,${new Date().toLocaleDateString("ja-JP")}`,
    "",
  ];

  return (
    meta.join("\n") +
    "\n" +
    [header, ...rows, totals].map((r) => r.join(",")).join("\n")
  );
}
