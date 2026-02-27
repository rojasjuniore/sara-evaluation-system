import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que no requieren autenticación
  if (pathname === "/admin/login") {
    // Si ya tiene token, redirigir al admin
    const token = await getToken({ 
      req: request,
      secret: process.env.AUTH_SECRET,
    });
    
    if (token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Rutas de admin que requieren autenticación
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (isAdminRoute || isAdminApiRoute) {
    const token = await getToken({ 
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    if (!token) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: "No autorizado" },
          { status: 401 }
        );
      }
      
      // Redirigir al login con callback URL
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
