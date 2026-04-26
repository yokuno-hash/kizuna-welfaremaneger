import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { userName, diaryEntries } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
あなたは障がい福祉サービス（就労継続支援B型）の個別支援計画モニタリング評価を作成する専門家です。
以下の日報記録をもとに、${userName}さんのモニタリング評価を作成してください。

【日報記録】
${diaryEntries}

以下のJSON形式で出力してください。文章は福祉専門職が書く自然な日本語にしてください。
余計な説明は不要です。JSONのみを返してください。

{
  "achievement": "達成度・成長の評価（2〜3文）",
  "issues": "課題・今後の支援ポイント（2〜3文）",
  "nextGoal": "次期の目標案（①②③の箇条書き形式で3つ）"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // JSON部分だけ抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "生成に失敗しました" }, { status: 500 });
    }

    const report = JSON.parse(jsonMatch[0]);
    return Response.json(report);
  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json({ error: "生成に失敗しました" }, { status: 500 });
  }
}
