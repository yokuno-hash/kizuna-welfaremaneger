import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const digest = createHmac("sha256", secret).update(body).digest("base64");
  return digest === signature;
}

async function replyMessage(replyToken: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifySignature(body, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const { events } = JSON.parse(body) as {
    events: Array<{
      type: string;
      replyToken: string;
      message?: { type: string; text: string };
      source: { userId: string };
    }>;
  };

  const supabase = createAdminClient();
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  for (const event of events ?? []) {
    if (event.type === "follow") {
      await replyMessage(
        event.replyToken,
        "友だち登録ありがとうございます！\n管理者に LINE 連携の設定を依頼してください。設定後、日報入力が LINE から行えるようになります。"
      );
      continue;
    }

    if (event.type !== "message" || event.message?.type !== "text") continue;

    const text = event.message.text.trim();

    if (text === "日報") {
      const url = liffId ? `https://liff.line.me/${liffId}` : "（LIFF URLが未設定です）";
      await replyMessage(event.replyToken, `日報入力はこちら：\n${url}`);
      continue;
    }

    if (text === "状況") {
      const { data: lineUser } = await supabase
        .from("line_users")
        .select("facility_id")
        .eq("line_user_id", event.source.userId)
        .single();

      if (!lineUser) {
        await replyMessage(event.replyToken, "LINE連携が設定されていません。管理者に設定を依頼してください。");
        continue;
      }

      const today = new Date().toISOString().slice(0, 10);
      const { data: diaries } = await supabase
        .from("diaries")
        .select("client_name")
        .eq("facility_id", lineUser.facility_id)
        .gte("recorded_at", `${today}T00:00:00.000Z`)
        .lte("recorded_at", `${today}T23:59:59.999Z`);

      const count = diaries?.length ?? 0;
      await replyMessage(event.replyToken, `本日（${today}）の日報入力済み：${count}件`);
      continue;
    }
  }

  return new Response("OK");
}
