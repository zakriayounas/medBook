import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import {
    extractUserId,
    validateAppointmentTime,
} from "../../../../../lib/UserHelpers";
import { convertToSQLDatetime } from "../../../../../utils/helpers";

export const GET = async (req) => {
    const { searchParams } = new URL(req.url);
    const isUserAppointments = searchParams.get("user");

    try {
        const userId = extractUserId(req);

        const appointments = await prisma.appointment.findMany({
            where: isUserAppointments ? { patientId: userId } : {},
            include: {
                doctor: {
                    select: {
                        fee: true,
                        ...(isUserAppointments && { addresses: true }),
                        ...(isUserAppointments && { specialty: true }),
                        profile: {
                            select: {
                                name: true,
                                profileColor: true,
                                profileImage: true,
                            },
                        },
                    },
                },
                ...(!isUserAppointments && {
                    patient: {
                        select: {
                            name: true,
                            profileColor: true,
                            profileImage: true,
                        },
                    },
                }),
            },
            orderBy: {
                id: 'desc',
            },
        });

        return NextResponse.json({ status: 200, appointments });
    } catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};

export const POST = async (req) => {

    try {
        const userId = extractUserId(req);
        const { appointment_date, appointment_time, doctorId } = await req.json();

        if (!appointment_date || !appointment_time || !doctorId) {
            return NextResponse.json(
                {
                    status: 400,
                    error:
                        "appointment_date, appointment_time, and doctorId are required",
                },
                { status: 400 }
            );
        }

        const validationResult = await validateAppointmentTime(
            appointment_date,
            appointment_time,
            doctorId
        );
        if (!validationResult.success) {
            return NextResponse.json(
                { status: 400, error: validationResult.error },
                { status: 400 }
            );
        }
        const formattedDateTime = convertToSQLDatetime(appointment_date, appointment_time);

        const appointmentDate = new Date(formattedDateTime);

        const appointment = await prisma.appointment.create({
            data: {
                appointment_date: appointmentDate,
                appointment_time,
                doctorId,
                patientId: userId,
            },
        });
        return NextResponse.json({ status: 200, appointment, message: "Appointment booked successfully!" });
    } catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};
