import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lineUserId = searchParams.get("lineUserId");
  const clientName = searchParams.get("clientName");
  const date = searchParams.get("date");

  if (!lineUserId || !clientName || !date) {
    return Response.json({ error: "missing params" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: lineUser } = await supabase
    .from("line_users")
    .select("facility_id")
    .eq("line_user_id", lineUserId)
    .single();

  if (!lineUser) {
    return Response.json({ error: "not_registered" }, { status: 403 });
  }

  const { data } = await supabase
    .from("daily_attendance")
    .select("client_name, attendance, lunch, transport")
    .eq("facility_id", lineUser.facility_id)
    .eq("client_name", clientName)
    .eq("recorded_date", date)
    .maybeSingle();

  return Response.json({ attendance: data ?? null });
}
