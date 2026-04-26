import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SupportPlanDocument } from "@/lib/pdf-templates/support-plan";
import { MonitoringReportDocument } from "@/lib/pdf-templates/monitoring-report";
import {
  ServiceRecordDocument,
  type ServiceRecordRow,
} from "@/lib/pdf-templates/service-record";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPdfElement(element: React.ReactElement): React.ReactElement<any> {
  return element;
}

export const maxDuration = 60;

type SupportPlanBody = {
  type: "support_plan";
  clientName: string;
  facilityId: string;
  periodStart: string;
  periodEnd: string;
  additionalData: {
    wish: string;
    longTermGoal: string;
    shortTermGoals: string[];
    supportContent: string;
    achievementCriteria?: string;
    creatorName?: string;
  };
};

type MonitoringBody = {
  type: "monitoring_report";
  clientName: string;
  facilityId: string;
  periodStart: string;
  periodEnd: string;
  additionalData?: {
    managerName?: string;
    preGenerated?: {
      achievement: string;
      issues: string;
      nextGoal: string;
    };
  };
};

type ServiceRecordBody = {
  type: "service_record";
  clientName: string;
  facilityId: string;
  year: number;
  month: number;
};

type RequestBody = SupportPlanBody | MonitoringBody | ServiceRecordBody;

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("facility_id")
      .eq("id", user.id)
      .single();

    const { data: facility } = await supabase
      .from("facilities")
      .select("name")
      .eq("id", profile?.facility_id)
      .single();

    const facilityName = facility?.name ?? body.facilityId;

    let pdfBuffer: Buffer;
    let filename: string;

    if (body.type === "support_plan") {
      const d = body.additionalData;
      pdfBuffer = await renderToBuffer(
        toPdfElement(React.createElement(SupportPlanDocument, {
          data: {
            clientName: body.clientName,
            facilityName,
            createdDate: new Date().toLocaleDateString("ja-JP"),
            periodStart: body.periodStart,
            periodEnd: body.periodEnd,
            wish: d.wish,
            longTermGoal: d.longTermGoal,
            shortTermGoals: d.shortTermGoals,
            supportContent: d.supportContent,
            achievementCriteria: d.achievementCriteria ?? "",
            creatorName: d.creatorName ?? "",
          },
        }))
      );
      filename = `個別支援計画書_${body.clientName}_${body.periodStart}.pdf`;
    } else if (body.type === "monitoring_report") {
      const { data: diaries } = await supabase
        .from("diaries")
        .select("recorded_at, attendance, ratings, staff_name")
        .eq("facility_id", body.facilityId)
        .eq("client_name", body.clientName)
        .gte("recorded_at", body.periodStart)
        .lte("recorded_at", body.periodEnd + "T23:59:59")
        .order("recorded_at", { ascending: false })
        .limit(60);

      const diaryText = (diaries ?? [])
        .filter((d) => d.attendance !== "●")
        .map((d) => {
          const date = new Date(d.recorded_at).toLocaleDateString("ja-JP");
          return `${date}（${d.staff_name}）: ${d.ratings?.eval ?? ""}`;
        })
        .join("\n");

      let achievement = body.additionalData?.preGenerated?.achievement ?? "";
      let issues = body.additionalData?.preGenerated?.issues ?? "";
      let nextGoal = body.additionalData?.preGenerated?.nextGoal ?? "";

      if (!achievement && diaryText && process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `あなたは障がい福祉サービスの個別支援計画モニタリング評価を作成する専門家です。
以下の日報記録をもとに、${body.clientName}さんのモニタリング評価を作成してください。

【日報記録】
${diaryText}

以下のJSON形式のみを返してください。
{
  "achievement": "達成度・成長の評価（2〜3文）",
  "issues": "課題・今後の支援ポイント（2〜3文）",
  "nextGoal": "次期の目標案（①②③の箇条書き形式で3つ）"
}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          achievement = parsed.achievement ?? "";
          issues = parsed.issues ?? "";
          nextGoal = parsed.nextGoal ?? "";
        }
      }

      pdfBuffer = await renderToBuffer(
        toPdfElement(React.createElement(MonitoringReportDocument, {
          data: {
            clientName: body.clientName,
            facilityName,
            monitoringDate: new Date().toLocaleDateString("ja-JP"),
            planCreatedDate: body.periodStart,
            achievement: achievement || `${body.clientName}さんの日報記録が不足しているため評価生成不可`,
            issues: issues || "継続的な観察が必要です",
            nextGoal: nextGoal || "前期目標を引き続き継続します",
            continuationPolicy: "change",
            managerName: body.additionalData?.managerName ?? "",
          },
        }))
      );
      filename = `モニタリング報告書_${body.clientName}_${new Date().toISOString().slice(0, 10)}.pdf`;
    } else {
      const { year, month } = body;

      const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
      const monthEnd = `${year}-${String(month).padStart(2, "0")}-31`;

      const { data: attendance } = await supabase
        .from("daily_attendance")
        .select("recorded_date, attendance, lunch, transport")
        .eq("facility_id", body.facilityId)
        .eq("client_name", body.clientName)
        .gte("recorded_date", monthStart)
        .lte("recorded_date", monthEnd);

      const rows: ServiceRecordRow[] = (attendance ?? []).map((a) => {
        const d = new Date(a.recorded_date);
        const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
        const isAbsent = a.attendance === "●";
        return {
          day: d.getDate(),
          weekday: weekdays[d.getDay()],
          attendance: a.attendance ?? "-",
          lunch: a.lunch ?? "-",
          transport: a.transport ?? "-",
          hours: isAbsent ? "-" : "6h",
        };
      });

      pdfBuffer = await renderToBuffer(
        toPdfElement(React.createElement(ServiceRecordDocument, {
          data: {
            clientName: body.clientName,
            facilityName,
            year,
            month,
            rows,
          },
        }))
      );
      filename = `実績記録票_${body.clientName}_${year}年${month}月.pdf`;
    }

    const safeFilename = encodeURIComponent(filename);
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${safeFilename}`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("generate-document error:", error);
    return Response.json({ error: "PDF生成に失敗しました" }, { status: 500 });
  }
}
