import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export const GET = async (req) => {
    try {
        // Fetch all transactions from the database
        const transactions = await prisma.transaction.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: true,
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
