import { NextResponse } from "next/server";
import {
  extractLoggedUserDetail,
  getIdFromParams,
} from "../../../../../../lib/UserHelpers";
import prisma from "../../../../../../lib/prisma";

export const POST = async (req, { params }) => {
  try {
    const { userId } = extractLoggedUserDetail(req);
    const { action = "cancel", note } = await req.json();
    const id = getIdFromParams(params);

    let updateData = {};
    let message = "";

    if (action === "cancel") {
      updateData = {
        isCancel: true,
        cancellationReason: note,
        canceledByUserId: userId,
      };
      message = "Appointment cancelled successfully!";
    } else if (action === "complete") {
      updateData = {
        isCompleted: true,
        completionSummary: note,
        completedByUserId: userId,
      };
      message = "Appointment marked as completed!";
    } else {
      return NextResponse.json({ status: 400, message: "Invalid action" });
    }

    await prisma.appointments.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ status: 200, message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};
