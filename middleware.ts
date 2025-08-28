import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => req.cookies.get(name)?.value } },
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session && req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}
