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

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 10,
    padding: 32,
    color: "#1e293b",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 2,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 4,
    fontSize: 9,
  },
  metaLabel: {
    color: "#64748b",
    width: 96,
  },
  metaValue: {
    flex: 1,
    color: "#1e293b",
  },
  divider: {
    borderBottom: "1px solid #cbd5e1",
    marginVertical: 10,
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    backgroundColor: "#312e81",
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sectionBody: {
    border: "1px solid #cbd5e1",
    borderTop: "none",
    padding: 8,
    minHeight: 44,
    fontSize: 9.5,
    lineHeight: 1.65,
    color: "#334155",
  },
  achievementRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
  },
  achievementOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    fontSize: 9,
    color: "#334155",
  },
  checkCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    border: "1px solid #64748b",
  },
  checkCircleFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    border: "1px solid #312e81",
    backgroundColor: "#312e81",
  },
  policyRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    borderTop: "1px solid #cbd5e1",
    paddingTop: 10,
    flexDirection: "row",
    gap: 20,
  },
  footerBlock: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 4,
  },
  footerLine: {
    borderBottom: "1px solid #94a3b8",
    paddingBottom: 6,
    fontSize: 9,
    color: "#334155",
    minHeight: 20,
  },
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    color: "#ffffff",
    backgroundColor: "#312e81",
  },
  badgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#312e81",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

export type MonitoringReportData = {
  clientName: string;
  facilityName: string;
  monitoringDate: string;
  planCreatedDate: string;
  achievement: string;
  issues: string;
  nextGoal: string;
  continuationPolicy?: "continue" | "change" | "end";
  policyNote?: string;
  managerName?: string;
};

export function MonitoringReportDocument({ data }: { data: MonitoringReportData }) {
  const policy = data.continuationPolicy ?? "change";

  return (
    <Document title={`モニタリング報告書_${data.clientName}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>モニタリング報告書</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>利用者名：</Text>
          <Text style={styles.metaValue}>{data.clientName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>実施日：</Text>
          <Text style={styles.metaValue}>{data.monitoringDate}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>計画作成日：</Text>
          <Text style={styles.metaValue}>{data.planCreatedDate}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>事業所名：</Text>
          <Text style={styles.metaValue}>{data.facilityName}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>■ 短期目標の達成状況（AI自動生成）</Text>
          <View style={styles.sectionBody}>
            <View style={styles.achievementRow}>
              {(["達成", "一部達成", "未達"] as const).map((label) => {
                const filled =
                  (label === "達成" && data.achievement.includes("達成")) ||
                  label === "一部達成";
                return (
                  <View key={label} style={styles.achievementOption}>
                    <View style={filled ? styles.checkCircleFilled : styles.checkCircle} />
                    <Text>{label}</Text>
                  </View>
                );
              })}
            </View>
            <Text>{data.achievement}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>■ サービス提供状況・課題</Text>
          <View style={styles.sectionBody}>
            <Text>{data.issues}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>■ 今後の方針</Text>
          <View style={styles.sectionBody}>
            <View style={styles.policyRow}>
              {([
                { value: "continue", label: "計画継続" },
                { value: "change", label: "計画変更" },
                { value: "end", label: "終了" },
              ] as const).map(({ value, label }) => (
                <View key={value} style={styles.achievementOption}>
                  <View
                    style={
                      policy === value
                        ? styles.checkCircleFilled
                        : styles.checkCircle
                    }
                  />
                  <Text>{label}</Text>
                </View>
              ))}
            </View>
            <Text>{data.nextGoal}</Text>
            {data.policyNote ? <Text>{data.policyNote}</Text> : null}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBlock}>
            <Text style={styles.footerLabel}>サービス管理責任者</Text>
            <Text style={styles.footerLine}>{data.managerName || " "}</Text>
          </View>
          <View style={styles.footerBlock}>
            <Text style={styles.footerLabel}>署名日</Text>
            <Text style={styles.footerLine}> </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
