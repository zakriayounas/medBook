import { NextResponse } from "next/server";
import { validateIsDoctorExists } from "../../../../../lib/doctorHelper";
import { checkDoctorAvailability } from "../../../../../lib/doctorSchedule";
import prisma from "../../../../../lib/prisma";
import { extractLoggedUserDetail, getQueryFilters } from "../../../../../lib/UserHelpers";
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
        return NextResponse.json({ status: 500, message: error.message || "Internal server error" });
    }
};

export const POST = async (req) => {
    try {
        const { userId } = extractLoggedUserDetail(req);
        const { appointmentDate, doctorId } = await req.json();
        if (!appointmentDate || !doctorId) {
            return NextResponse.json({
                status: 400,
                error: "appointmentDate and doctorId are required",
            }, { status: 400 });
        }

        const { exists } = await validateIsDoctorExists({ id: doctorId });
        if (!exists) {
            return NextResponse.json({
                status: 404,
                error: "Doctor not found",
            }, { status: 404 });
        }

        const isSlotAvailable = await checkDoctorAvailability(doctorId, appointmentDate);
        if (!isSlotAvailable) {
            return NextResponse.json({
                error: "The selected time slot is not available for the doctor.",
            }, { status: 400 });
        }

        const appointment = await prisma.appointments.create({
            data: {
                appointmentDate: new Date(appointmentDate),
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
        return NextResponse.json({
            status: 500,
            message: error.message || "Internal server error"
        });
    }
};
