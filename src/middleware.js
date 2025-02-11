import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Allow public access to login & signup routes
    if (pathname === "/api/auth/login" || pathname === "/api/auth/signup") {
        return NextResponse.next();
    }

    // Require authentication for protected API routes
    if (pathname.startsWith("/api")) {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        try {
            const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET_KEY));
            const response = NextResponse.next();
            response.headers.set("x-user-id", payload.userId); // Attach userId to the response
            return response;
        } catch (error) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 403 }
            );
        }
    }

    return NextResponse.next();
}

// Middleware configuration (applies to all API routes)
export const config = {
    matcher: ["/api/:path*"],
};
