import { NextResponse } from "next/server";
import { getIdFromParams } from "../../../../../../lib/UserHelpers";

export const POST = async (req, { params }) => {
    try {
        const id = await getIdFromParams(params);
        await prisma.appointment.update({
            where: { id },
            data: {
                isCancel: true
            },
        });

        return NextResponse.json({ status: 200, message: "Appointment cancelled successfully!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 500, error: error.message });
    }
};
