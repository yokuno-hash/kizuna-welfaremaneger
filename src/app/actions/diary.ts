"use server";

import { createClient } from "@/lib/supabase/server";

type DiaryPayload = {
  clientName: string;
  staffName: string;
  attendance: string;
  breakfast: string;
  sleep: string;
  ratings: Record<string, string>;
  comments: Record<string, string>;
};

export async function saveDiary(payload: DiaryPayload) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "ログインが必要です" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("facility_id")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("diaries").insert({
    staff_id: user.id,
    facility_id: profile?.facility_id ?? null,
    client_name: payload.clientName,
    staff_name: payload.staffName,
    attendance: payload.attendance,
    breakfast: payload.breakfast,
    sleep: payload.sleep,
    ratings: payload.ratings,
    comments: payload.comments,
    recorded_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  return { success: true };
}
