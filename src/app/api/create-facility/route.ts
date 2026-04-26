import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { facilityName, email, password } = await request.json();

  if (!facilityName || !email || !password) {
    return Response.json({ error: "全項目を入力してください" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // ① 事業所を作成
    const { data: facility, error: facilityError } = await supabase
      .from("facilities")
      .insert({ name: facilityName })
      .select()
      .single();

    if (facilityError) throw new Error(`事業所作成失敗: ${facilityError.message}`);

    // ② ユーザーアカウントを作成
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "facility" },
    });

    if (userError) {
      // ユーザー作成失敗したら事業所も削除
      await supabase.from("facilities").delete().eq("id", facility.id);
      throw new Error(`ユーザー作成失敗: ${userError.message}`);
    }

    // ③ profiles に紐付け
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: userData.user.id, facility_id: facility.id });

    if (profileError) throw new Error(`プロフィール紐付け失敗: ${profileError.message}`);

    return Response.json({ success: true, facilityId: facility.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "作成に失敗しました";
    return Response.json({ error: msg }, { status: 500 });
  }
}
