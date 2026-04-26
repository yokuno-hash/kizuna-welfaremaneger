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

const CIRCLED = ["①", "②", "③", "④", "⑤"];

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
    width: 72,
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
    backgroundColor: "#1e40af",
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 0,
  },
  sectionBody: {
    border: "1px solid #cbd5e1",
    borderTop: "none",
    padding: 8,
    minHeight: 36,
    fontSize: 9.5,
    lineHeight: 1.6,
    color: "#334155",
  },
  goalRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  goalIndex: {
    width: 16,
    fontSize: 9.5,
    color: "#334155",
  },
  goalText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.6,
    color: "#334155",
  },
  footer: {
    marginTop: 16,
    borderTop: "1px solid #cbd5e1",
    paddingTop: 10,
  },
  footerRow: {
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
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    fontSize: 9,
    color: "#334155",
    marginTop: 4,
  },
  checkBox: {
    width: 10,
    height: 10,
    border: "1px solid #64748b",
  },
});

export type SupportPlanData = {
  clientName: string;
  facilityName: string;
  createdDate: string;
  periodStart: string;
  periodEnd: string;
  wish: string;
  longTermGoal: string;
  shortTermGoals: string[];
  supportContent: string;
  achievementCriteria: string;
  creatorName?: string;
};

export function SupportPlanDocument({ data }: { data: SupportPlanData }) {
  const goals =
    data.shortTermGoals.length > 0
      ? data.shortTermGoals
      : ["", "", ""];

  return (
    <Document title={`個別支援計画書_${data.clientName}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>個別支援計画書</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>利用者名：</Text>
          <Text style={styles.metaValue}>{data.clientName}</Text>
          <Text style={styles.metaLabel}>作成日：</Text>
          <Text style={styles.metaValue}>{data.createdDate}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>計画期間：</Text>
          <Text style={styles.metaValue}>
            {data.periodStart} ～ {data.periodEnd}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>事業所名：</Text>
          <Text style={styles.metaValue}>{data.facilityName}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>■ 本人の希望・ニーズ</Text>
          <View style={styles.sectionBody}>
            <Text>{data.wish || " "}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>■ 長期目標</Text>
          <View style={styles.sectionBody}>
            <Text>{data.longTermGoal || " "}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>■ 短期目標</Text>
          <View style={styles.sectionBody}>
            {goals.map((g, i) => (
              <View key={i} style={styles.goalRow}>
                <Text style={styles.goalIndex}>{CIRCLED[i] ?? `(${i + 1})`}</Text>
                <Text style={styles.goalText}>{g || " "}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>■ 支援内容</Text>
          <View style={styles.sectionBody}>
            <Text>{data.supportContent || " "}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>■ 達成基準</Text>
          <View style={styles.sectionBody}>
            <Text>{data.achievementCriteria || " "}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View style={styles.footerBlock}>
              <Text style={styles.footerLabel}>作成者（サービス管理責任者）</Text>
              <Text style={styles.footerLine}>{data.creatorName || " "}</Text>
            </View>
            <View style={styles.footerBlock}>
              <Text style={styles.footerLabel}>本人同意</Text>
              <View style={styles.consentRow}>
                <View style={styles.checkBox} />
                <Text>同意する　　　年　　月　　日</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
