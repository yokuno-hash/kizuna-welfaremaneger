export async function POST(request: Request) {
  try {
    const { message, userIds } = await request.json();

    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
      return Response.json({ error: "LINE_CHANNEL_ACCESS_TOKEN が未設定です" }, { status: 500 });
    }

    // 複数ユーザーへ送信
    const results = await Promise.all(
      (userIds as string[]).map((userId: string) =>
        fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to: userId,
            messages: [{ type: "text", text: message }],
          }),
        }).then((r) => r.json())
      )
    );

    return Response.json({ success: true, results });
  } catch (error) {
    console.error("LINE送信エラー:", error);
    return Response.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
