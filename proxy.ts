import { NextRequest, NextResponse } from "next/server";
import { checkSession } from "./lib/api/serverApi";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let isAuthenticated = Boolean(accessToken);
  let setCookie: string[] = [];

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!accessToken && refreshToken) {
    try {
      const res = await checkSession();

      const cookies = res?.headers?.["set-cookie"];
      setCookie = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];

      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  let response: NextResponse;

  if (!isAuthenticated && isPrivateRoute) {
    response = NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isAuthenticated && isPublicRoute) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else {
    response = NextResponse.next();
  }

  setCookie.forEach((cookie) => {
    response.headers.append("set-cookie", cookie);
  });

  return response;
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
