import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("🔥 Middleware hit for", req.nextUrl.pathname);

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("🚫 No user → redirecting");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const userId = user.id;
  console.log("✅ Verified user found", userId);

  // Restrict /settings to only your account
  if (req.nextUrl.pathname.startsWith("/settings")) {
    const bossId = process.env.BOSS_SUPABASE_UID!;
    if (userId !== bossId) {
      console.log("🚫 Unauthorized → redirecting");
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/settings",
    "/settings/:path*",
  ],
};
