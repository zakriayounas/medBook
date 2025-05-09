import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { extractLoggedUserDetail, getUserWithoutPassword } from "../../../../../../lib/UserHelpers";

export const GET = async (req) => {
    try {
        const { userId } = extractLoggedUserDetail(req);
        const existingUser = await prisma.users.findUnique({
            where: { id: userId },
        });

        return NextResponse.json({
            status: 200,
            user: getUserWithoutPassword(existingUser),

        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 500, message: error.message || "Internal server error" });
    }
};
