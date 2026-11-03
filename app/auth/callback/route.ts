import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const supabase = await supabaseServer();
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const ok = code
    ? !(await supabase.auth.exchangeCodeForSession(code)).error
    : token_hash && type ? !(await supabase.auth.verifyOtp({ token_hash, type })).error : false;
  return NextResponse.redirect(new URL(ok ? "/cabinets" : "/login?error=link", url.origin));
}
