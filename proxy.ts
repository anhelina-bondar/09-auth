import { NextRequest, NextResponse } from "next/server";
import { checkSession } from "./lib/api/serverApi";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

function getSetCookieHeaders(setCookie?: string[] | string) {
  if (!setCookie) return [];
  return Array.isArray(setCookie) ? setCookie : [setCookie];
}

function applySetCookieHeaders(response: NextResponse, cookies: string[]) {
  cookies.forEach((cookie) => {
    response.headers.append("set-cookie", cookie);
  });

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let isAuthenticated = Boolean(accessToken);
  let updatedCookies: string[] = [];

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!accessToken && refreshToken) {
    try {
      const res = await checkSession();

      updatedCookies = getSetCookieHeaders(res?.headers?.["set-cookie"]);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated && isPrivateRoute) {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    return applySetCookieHeaders(response, updatedCookies);
  }

  if (isAuthenticated && isPublicRoute) {
    const response = NextResponse.redirect(new URL("/", request.url));
    return applySetCookieHeaders(response, updatedCookies);
  }

  const response = NextResponse.next();
  return applySetCookieHeaders(response, updatedCookies);
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
