import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase のセッションを更新しながら取得
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 未ログイン → /login へ
  if (!user) {
    if (pathname === "/login") return supabaseResponse;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ログイン済みの場合: ロールを取得
  const role = user.user_metadata?.role ?? "facility";

  // /login にいたらロール別トップへリダイレクト
  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin" : "/";
    return NextResponse.redirect(url);
  }

  // admin ユーザーが / にアクセスしたら /admin へ
  if (role === "admin" && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // facility ユーザーが admin 専用ページにアクセスしたら / へ
  const adminPaths = ["/admin", "/facilities", "/clients", "/status"];
  if (role === "facility" && adminPaths.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|liff|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
