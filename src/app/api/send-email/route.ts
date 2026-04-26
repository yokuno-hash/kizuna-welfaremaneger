import { Resend } from "resend";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { to, subject, body } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "福祉運営指導サポート <noreply@kizuna-welfare.jp>",
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1e40af;">福祉運営指導サポート</h2>
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 16px 0;">
            ${body.replace(/\n/g, "<br>")}
          </div>
          <p style="color: #94a3b8; font-size: 12px;">合同会社絆</p>
        </div>
      `,
    });

    if (error) return Response.json({ error }, { status: 500 });
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("メール送信エラー:", error);
    return Response.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
