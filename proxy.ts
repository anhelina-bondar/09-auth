import { NextRequest, NextResponse } from "next/server";
import { checkSession } from "./lib/api/serverApi";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

function applySetCookie(response: NextResponse, setCookie?: string[] | string) {
  if (!setCookie) return;

  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

  cookies.forEach((cookie) => {
    const [cookiePart] = cookie.split(";");
    const [name, ...valueParts] = cookiePart.split("=");

    if (!name || valueParts.length === 0) return;

    response.cookies.set(name.trim(), valueParts.join("=").trim());
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let isAuthenticated = Boolean(accessToken);
  let response = NextResponse.next();

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!accessToken && refreshToken) {
    try {
      const res = await checkSession();
      applySetCookie(response, res?.headers?.["set-cookie"]);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated && isPrivateRoute) {
    response = NextResponse.redirect(new URL("/sign-in", request.url));
    return response;
  }

  if (isAuthenticated && isPublicRoute) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
