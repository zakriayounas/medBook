import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const exemptedPaths = [
    "/api/auth/login",
    "/api/auth/signup",
];

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Handle CORS Preflight (OPTIONS) Requests
    if (req.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    }

    // Allow exempted paths to pass through
    if (exemptedPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Extract token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1]; // Expecting "Bearer <token>"

    if (!token) {
        return NextResponse.json({ message: "Unauthorized - No token provided" }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET_KEY)
        );

        const response = NextResponse.next();
        response.headers.set("x-user-id", payload.userId);
        response.headers.set("Access-Control-Allow-Origin", "*");

        return response;
    } catch (err) {
        return NextResponse.json({ message: "Unauthorized - Invalid token" }, { status: 401 });
    }
}

export const config = {
    matcher: "/api/:path*",
};
