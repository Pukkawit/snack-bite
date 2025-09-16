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

  // Get tenant slug for this user
  const { data: tenantOwner } = await supabase
    .from("snack_bite_tenant_owners")
    .select("slug")
    .eq("user_id", user.id)
    .single();

  const userTenantSlug = tenantOwner?.slug ?? null;

  // Extract slug from URL path (e.g. /admin/<slug>)
  const pathSegments = req.nextUrl.pathname.split("/");
  const paramsSlug = pathSegments[2] ?? null;

  if (!userTenantSlug || paramsSlug !== userTenantSlug) {
    console.log("🚫 Unauthorized tenant slug → redirecting");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Restrict /settings to only Boss
  if (req.nextUrl.pathname.startsWith("/settings")) {
    const bossId = process.env.NEXT_PUBLIC_DEFAULT_BOSS_SUPABASE_UID!;
    if (user.id !== bossId) {
      console.log("🚫 Unauthorized to settings → redirecting");
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return res; // ✅ always return res
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/settings/:path*",
  ],
};
