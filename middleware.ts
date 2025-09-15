import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("🔥 Middleware hit for", req.nextUrl.pathname);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Middleware can't persist cookies back to request,
            // but NextResponse handles them correctly
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.log("🚫 No session → redirecting");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  console.log("✅ Session found", session.user.id);
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
