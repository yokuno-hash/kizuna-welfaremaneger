"use server";

import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function issueLineRegistrationToken(
  staffName: string,
  role: string
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("facility_id")
    .eq("id", user.id)
    .single();

  if (!profile?.facility_id) return { error: "施設情報が取得できません" };

  const token = randomBytes(16).toString("hex");
  const admin = createAdminClient();

  const { error } = await admin.from("line_registration_tokens").insert({
    token,
    facility_id: profile.facility_id,
    staff_name: staffName,
    role,
  });

  if (error) return { error: error.message };

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  const url = `https://liff.line.me/${liffId}?token=${token}`;

  return { url };
}

export async function getLineConnections(
  facilityId: string
): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("line_users")
    .select("staff_name")
    .eq("facility_id", facilityId);

  return (data ?? []).map((r: { staff_name: string }) => r.staff_name);
}

export async function disconnectLine(
  staffName: string,
  facilityId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("line_users")
    .delete()
    .eq("staff_name", staffName)
    .eq("facility_id", facilityId);

  if (error) return { error: error.message };
  return { success: true };
}
