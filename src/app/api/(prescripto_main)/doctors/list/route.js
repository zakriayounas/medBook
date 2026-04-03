import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export const GET = async (req) => {
  try {
    const doctors = await prisma.users.findMany({
      where: {
        role: "DOCTOR",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return NextResponse.json({
      status: 200,
      doctors,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};
