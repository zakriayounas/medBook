import { NextResponse } from "next/server";
import { getIdFromParams } from "../../../../../../lib/UserHelpers";
import prisma from "../../../../../../lib/prisma";

export const POST = async (req, { params }) => {
    try {
        const id = getIdFromParams(params);
        await prisma.appointments.update({
            where: { id },
            data: {
                isCancel: true
            },
        });

        return NextResponse.json({ status: 200, message: "Appointment cancelled successfully!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 500, message: error.message || "Internal server error" });
    }
};
