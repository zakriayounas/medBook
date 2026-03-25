import { NextResponse } from "next/server";
import { getIdFromParams } from "../../../../../../lib/UserHelpers";
import prisma from "../../../../../../lib/prisma";

export const POST = async (req, { params }) => {
  try {
    const { action = "cancel" } = await req.json();
    const id = getIdFromParams(params);

    let updateData = {};
    let message = "";

    if (action === "cancel") {
      updateData = { isCancel: true };
      message = "Appointment cancelled successfully!";
    } else if (action === "complete") {
      updateData = { isCompleted: true };
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