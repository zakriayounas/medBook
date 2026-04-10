import { NextResponse } from "next/server";
import { validateIsDoctorExists } from "../../../../../lib/doctorHelper";
import { checkDoctorAvailability } from "../../../../../lib/doctorSchedule";
import prisma from "../../../../../lib/prisma";
import {
  extractLoggedUserDetail,
  getQueryFilters,
} from "../../../../../lib/UserHelpers";
import { v4 as uuidv4 } from "uuid";
const fieldsIncludeObj = (userRole) => {
  return {
    ...(userRole !== "DOCTOR" && {
      doctor: {
        select: {
          fee: true,
          ...(userRole === "PATIENT" && { specialty: true }),
          profile: {
            select: {
              name: true,
              profileColor: true,
              profileImage: true,
              addresses: true,
            },
          },
        },
      },
    }),
    ...(userRole !== "PATIENT" && {
      patient: {
        select: {
          name: true,
          profileColor: true,
          profileImage: true,
        },
      },
    }),
    reviews: {
      select: {
        comment: true,
        rating: true,
        createdAt: true,
      },
    },
    transactions: {
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    },
  };
};

export const GET = async (req) => {
  const { whereClause, limitRecords, skipRecords, orderBy, userRole, page } =
    getQueryFilters(req, "appointments");
  try {
    const total = await prisma.appointments.count({
      where: whereClause,
    });
    const appointments = await prisma.appointments.findMany({
      where: whereClause,
      include: fieldsIncludeObj(userRole),
      orderBy,
      skip: skipRecords,
      take: limitRecords,
    });
    const formattedAppointments = appointments.map(
      ({ transactions, ...rest }) => {
        return {
          ...rest,
          isPaid: transactions?.length > 0,
        };
      },
    );

    const totalPages = Math.ceil(total / limitRecords);

    return NextResponse.json({
      status: 200,
      appointments: formattedAppointments,
      pagination: {
        total,
        pageSize: limitRecords,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

export const POST = async (req) => {
  try {
    const { userId } = extractLoggedUserDetail(req);
    const { appointmentDate, doctorId } = await req.json();
    if (!appointmentDate || !doctorId) {
      return NextResponse.json(
        {
          status: 400,
          error: "appointmentDate and doctorId are required",
        },
        { status: 400 },
      );
    }

    const { exists } = await validateIsDoctorExists({
      id: doctorId,
      profile: { deletedAt: null },
    });
    if (!exists) {
      return NextResponse.json(
        {
          status: 404,
          error: "Doctor not found",
        },
        { status: 404 },
      );
    }

    const isSlotAvailable = await checkDoctorAvailability(
      doctorId,
      appointmentDate,
    );
    if (!isSlotAvailable) {
      return NextResponse.json(
        {
          error: "The selected time slot is not available for the doctor.",
        },
        { status: 400 },
      );
    }

    const appointment = await prisma.appointments.create({
      data: {
        appointmentDate: new Date(appointmentDate),
        doctorId,
        patientId: userId,
        uuid: uuidv4(),
      },
    });

    return NextResponse.json({
      status: 200,
      appointment,
      message: "Appointment booked successfully!",
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};
