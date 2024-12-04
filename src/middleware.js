import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    // Handle CORS for all requests
    const response = NextResponse.next();
    response.headers.append("Access-Control-Allow-Origin", req.headers.get("Origin") || "*");
    response.headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle CORS for OPTIONS requests
    if (req.method === "OPTIONS") {
        return response;
    }

    // Exclude login and signup routes from authentication checks
    if (pathname === "/api/auth/login" || pathname === "/api/auth/signup") {
        return response; // Skip authentication for these routes
    }
    // Handle API routes authentication
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

            // Attach userId to the request headers
            response.headers.set("x-user-id", payload.userId); // Assuming `userId` is part of the payload
            return response;
        } catch (error) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 403 }
            );
        }
    }

    return response; // Proceed to next handler for other cases
}

// Configuration for the middleware
export const config = {
    matcher: ["/api/appointments", "/api/update-profile", '/api/view-profile'],
};

