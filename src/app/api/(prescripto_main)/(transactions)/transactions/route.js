import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { extractLoggedUserDetail } from "../../../../../../lib/UserHelpers";

export const GET = async (req) => {
    try {

        const { userRole, doctorId, userId } = extractLoggedUserDetail(req)
        // Fetch all transactions from the database
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: userRole === "PATIENT" ? userId : undefined,
                appointment: {
                    doctorId: userRole === "DOCTOR" ? doctorId : undefined,
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: userRole === "ADMIN" ? true : false,
                appointment: true,
            },
        });

        return NextResponse.json({
            status: 200,
            transactions,
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({
            status: 500,
            message: error.message || "Internal server error"
        });
    }
};
