import { NextResponse } from "next/server";
import { checkDoctorAvailability } from "../../../../../lib/doctorSchedule";
import prisma from "../../../../../lib/prisma";
import { extractUserId, getQueryFilters } from "../../../../../lib/UserHelpers";
import { validateIsDoctorExists } from "../../../../../lib/doctorHelper";
import { formatToLocalISOString } from "../../../../../utils/helpers";
const fieldsIncludeObj = (userRole) => {
    return {
        ...(userRole !== "DOCTOR" && {
            doctor: {
                select: {
                    fee: true,
                    ...(userRole === "PATIENT" && { addresses: true }),
                    ...(userRole === "PATIENT" && { specialty: true }),
                    profile: {
                        select: {
                            name: true,
                            profileColor: true,
                            profileImage: true,
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
    };
};

export const GET = async (req) => {
    const { whereClause, limitRecords, skipRecords, orderBy, userRole } =
        getQueryFilters(req);

    try {
        const appointments = await prisma.appointments.findMany({
            where: whereClause,
            include: fieldsIncludeObj(userRole),
            orderBy,
            skip: skipRecords,
            take: limitRecords,
        });

        return NextResponse.json({ status: 200, appointments });
    } catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};

export const POST = async (req) => {
    try {
        const userId = extractUserId(req);
        const { appointmentDate, doctorId } = await req.json();
        if (!appointmentDate || !doctorId) {
            return NextResponse.json(
                {
                    status: 400,
                    error: "appointmentDate and doctorId are required",
                },
                { status: 400 }
            );
        }

        const { exists } = await validateIsDoctorExists({ id: doctorId });
        if (!exists) {
            return NextResponse.json(
                {
                    status: 404,
                    error: "Doctor not found",
                },
                { status: 404 }
            );
        }
        const formattedDate = formatToLocalISOString(appointmentDate);
        const isSlotAvailable = await checkDoctorAvailability(
            doctorId,
            formattedDate
        );
        if (!isSlotAvailable) {
            return NextResponse.json(
                {
                    status: 400,
                    error: "The selected time slot is not available for the doctor.",
                },
                { status: 400 }
            );
        }
        const appointment = await prisma.appointments.create({
            data: {
                appointmentDate: new Date(formattedDate),
                doctorId,
                patientId: userId,
            },
        });

        return NextResponse.json({
            status: 200,
            appointment,
            message: "Appointment booked successfully!",
        });
    } catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};
