import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export const GET = async (req) => {
  try {
    const doctors = await prisma.users.findMany({
      where: {
        role: "DOCTOR",
        doctor: {
          isNot: null,
        },
      },
      select: {
        name: true,
        profileImage: true,
        profileColor: true,
        doctor: {
          select: {
            id: true,
            uuid: true,
          },
        },
      },
    });
    const formattedDoctors = doctors.map((doctor) => ({
      name: doctor.name,
      profileImage: doctor.profileImage,
      profileColor: doctor.profileColor,
      id: doctor.doctor.id,
      uuid: doctor.doctor.uuid,
    }));
    console.log("Fetched doctors:", formattedDoctors);
    return NextResponse.json({
      status: 200,
      doctors: formattedDoctors,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};
