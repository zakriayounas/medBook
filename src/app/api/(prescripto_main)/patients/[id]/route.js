import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { getIdFromParams } from "../../../../../../lib/UserHelpers";

export const GET = async (req, { params }) => {
  try {
    const id = getIdFromParams(params);

    const patient = await prisma.users.findFirst({
      where: {
        id,
        role: "PATIENT",
      },
      include: {
        appointments: true,
        transactions: true,
        reviews: true,
      },
    });
    if (!patient) {
      return NextResponse.json({ status: 404, message: "Patient not found" });
    }
    return NextResponse.json({
      status: 200,
      patient,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};
