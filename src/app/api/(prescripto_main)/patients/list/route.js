import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export const GET = async (req) => {
  try {
    const patients = await prisma.users.findMany({
      where: {
        role: "PATIENT",
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
        profileColor: true,
        uuid: true,
      },
    });
    return NextResponse.json({
      status: 200,
      patients,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};
