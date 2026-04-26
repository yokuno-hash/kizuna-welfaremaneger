import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { token, lineUserId } = await request.json();

  if (!token || !lineUserId) {
    return Response.json({ error: "token and lineUserId are required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: tokenData } = await supabase
    .from("line_registration_tokens")
    .select("id, facility_id, staff_name, role, used_at, expires_at")
    .eq("token", token)
    .is("used_at", null)
    .single();

  if (!tokenData || new Date(tokenData.expires_at) < new Date()) {
    return Response.json({ error: "invalid_token" }, { status: 400 });
  }

  const { error: upsertError } = await supabase.from("line_users").upsert(
    {
      line_user_id: lineUserId,
      facility_id: tokenData.facility_id,
      staff_name: tokenData.staff_name,
      role: tokenData.role,
    },
    { onConflict: "line_user_id" }
  );

  if (upsertError) {
    return Response.json({ error: upsertError.message }, { status: 500 });
  }

  await supabase
    .from("line_registration_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", tokenData.id);

  return Response.json({ success: true });
}
