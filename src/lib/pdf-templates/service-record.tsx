import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { registerFonts } from "./fonts";

registerFonts();

const COL_WIDTHS = {
  day: 22,
  attendance: 22,
  lunch: 22,
  transport: 22,
  hours: 22,
  note: "auto" as const,
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    padding: 24,
    color: "#1e293b",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: 8.5,
  },
  metaLabel: {
    color: "#64748b",
    width: 72,
  },
  metaValue: {
    flex: 1,
    color: "#1e293b",
  },
  divider: {
    borderBottom: "1px solid #cbd5e1",
    marginVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    borderBottom: "1px solid #1e40af",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5px solid #e2e8f0",
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "0.5px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  cellDay: {
    width: COL_WIDTHS.day,
    paddingVertical: 3,
    paddingHorizontal: 2,
    textAlign: "center",
    borderRight: "0.5px solid #e2e8f0",
    fontSize: 8.5,
  },
  cellAtt: {
    width: COL_WIDTHS.attendance,
    paddingVertical: 3,
    paddingHorizontal: 2,
    textAlign: "center",
    borderRight: "0.5px solid #e2e8f0",
    fontSize: 8.5,
  },
  cellLunch: {
    width: COL_WIDTHS.lunch,
    paddingVertical: 3,
    paddingHorizontal: 2,
    textAlign: "center",
    borderRight: "0.5px solid #e2e8f0",
    fontSize: 8.5,
  },
  cellTransport: {
    width: COL_WIDTHS.transport,
    paddingVertical: 3,
    paddingHorizontal: 2,
    textAlign: "center",
    borderRight: "0.5px solid #e2e8f0",
    fontSize: 8.5,
  },
  cellHours: {
    width: COL_WIDTHS.hours,
    paddingVertical: 3,
    paddingHorizontal: 2,
    textAlign: "center",
    borderRight: "0.5px solid #e2e8f0",
    fontSize: 8.5,
  },
  cellNote: {
    flex: 1,
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontSize: 8,
    color: "#64748b",
  },
  headerCell: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 8,
  },
  summaryRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 16,
    fontSize: 9,
    color: "#334155",
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 4,
  },
  summaryItem: {
    flexDirection: "row",
    gap: 4,
  },
  summaryLabel: {
    color: "#64748b",
  },
  summaryValue: {
    fontWeight: "bold",
    color: "#1e293b",
  },
});

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export type ServiceRecordRow = {
  day: number;
  weekday: string;
  attendance: string;
  lunch: string;
  transport: string;
  hours: string;
  note?: string;
};

export type ServiceRecordData = {
  clientName: string;
  facilityName: string;
  year: number;
  month: number;
  rows: ServiceRecordRow[];
};

function buildRows(data: ServiceRecordData): ServiceRecordRow[] {
  const daysInMonth = new Date(data.year, data.month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const existing = data.rows.find((r) => r.day === day);
    if (existing) return existing;
    const weekday = WEEKDAYS[new Date(data.year, data.month - 1, day).getDay()];
    return { day, weekday, attendance: "-", lunch: "-", transport: "-", hours: "-" };
  });
}

export function ServiceRecordDocument({ data }: { data: ServiceRecordData }) {
  const rows = buildRows(data);
  const attendedRows = rows.filter((r) => r.attendance === "○" || r.attendance === "△");
  const totalDays = attendedRows.length;
  const lunchCount = rows.filter((r) => r.lunch === "○").length;
  const transportCount = rows.filter((r) => r.transport === "○" || r.transport === "△").length;

  return (
    <Document title={`実績記録票_${data.clientName}_${data.year}年${data.month}月`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          サービス提供実績記録票（{data.year}年{data.month}月分）
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>事業所名：</Text>
          <Text style={styles.metaValue}>{data.facilityName}</Text>
          <Text style={styles.metaLabel}>利用者名：</Text>
          <Text style={styles.metaValue}>{data.clientName}</Text>
        </View>

        <View style={styles.divider} />

        {/* テーブルヘッダー */}
        <View style={styles.tableHeader}>
          <Text style={[styles.cellDay, styles.headerCell]}>日</Text>
          <Text style={[styles.cellDay, styles.headerCell]}>曜</Text>
          <Text style={[styles.cellAtt, styles.headerCell]}>出欠</Text>
          <Text style={[styles.cellLunch, styles.headerCell]}>昼食</Text>
          <Text style={[styles.cellTransport, styles.headerCell]}>送迎</Text>
          <Text style={[styles.cellHours, styles.headerCell]}>時間</Text>
          <Text style={[styles.cellNote, styles.headerCell]}>備考</Text>
        </View>

        {/* データ行 */}
        {rows.map((row, i) => {
          const isSunday = row.weekday === "日";
          const isSaturday = row.weekday === "土";
          const isAbsent = row.attendance === "●";
          const rowStyle = i % 2 === 0 ? styles.tableRow : styles.tableRowAlt;
          const dayColor =
            isSunday
              ? "#dc2626"
              : isSaturday
              ? "#2563eb"
              : isAbsent
              ? "#94a3b8"
              : "#1e293b";

          return (
            <View key={row.day} style={rowStyle}>
              <Text style={[styles.cellDay, { color: dayColor }]}>{row.day}</Text>
              <Text style={[styles.cellDay, { color: dayColor }]}>{row.weekday}</Text>
              <Text style={[styles.cellAtt, { color: isAbsent ? "#94a3b8" : "#1e293b" }]}>
                {row.attendance}
              </Text>
              <Text style={styles.cellLunch}>{row.lunch}</Text>
              <Text style={styles.cellTransport}>{row.transport}</Text>
              <Text style={styles.cellHours}>{row.hours}</Text>
              <Text style={styles.cellNote}>{row.note ?? ""}</Text>
            </View>
          );
        })}

        {/* サマリー */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>出席日数：</Text>
            <Text style={styles.summaryValue}>{totalDays}日</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>昼食加算：</Text>
            <Text style={styles.summaryValue}>{lunchCount}日</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>送迎加算：</Text>
            <Text style={styles.summaryValue}>{transportCount}日</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
