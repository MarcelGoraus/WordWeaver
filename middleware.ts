// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import subdomains from "./subdomains.json";

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host");

  // Define allowed Domains (localhost and production domain)
  const allowedDomains: string[] = ["localhost:3000", "wordweaver.com"];

  // Verify if hostname exist in allowed domains
  const isAllowedDomain = allowedDomains.some((domain) =>
    hostname?.includes(domain),
  );

  // Extract the possible subdomain in the URL
  const subdomain = hostname?.split(".")[0];

  // If we stay in an allowed domain and it's not a subdomain, allow the request.
  if (isAllowedDomain && !subdomains.some((d) => d.subdomain === subdomain)) {
    return NextResponse.next();
  }

  const subdomainData = subdomains.find((d) => d.subdomain === subdomain);

  if (subdomainData) {
    // Rewrite the URL in the dynamic route based on the subdomain
    return NextResponse.rewrite(
      new URL(`/${subdomain}${url.pathname}`, req.url),
    );
  }

  return new Response(null, { status: 404 });
}
