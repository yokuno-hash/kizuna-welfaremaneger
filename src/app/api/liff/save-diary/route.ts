import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();
  const { lineUserId, clientName, attendance, lunch, transport, comment, additionalValues } = body;

  if (!lineUserId || !clientName) {
    return Response.json({ error: "missing required fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: lineUser } = await supabase
    .from("line_users")
    .select("facility_id, staff_name, role")
    .eq("line_user_id", lineUserId)
    .single();

  if (!lineUser) {
    return Response.json({ error: "not_registered" }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: da } = await supabase
    .from("daily_attendance")
    .select("attendance, lunch, transport")
    .eq("facility_id", lineUser.facility_id)
    .eq("client_name", clientName)
    .eq("recorded_date", today)
    .maybeSingle();

  const { error } = await supabase.from("diaries").insert({
    staff_id: null,
    facility_id: lineUser.facility_id,
    client_name: clientName,
    staff_name: lineUser.staff_name,
    attendance: da?.attendance ?? attendance,
    breakfast: da?.lunch ?? lunch,
    sleep: da?.transport ?? transport,
    ratings: { ...(additionalValues ?? {}), eval: comment ?? "" },
    comments: { role: lineUser.role },
    recorded_at: new Date().toISOString(),
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
