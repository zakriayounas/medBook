import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import {
    getIdFromParams,
    getUserWithoutPassword,
} from "../../../../../../lib/UserHelpers";
import bcrypt from "bcrypt";
import { includeDoctorFullProfile } from "../../../../../../lib/doctorHelper";
const getDoctorBookedSlots = async (id) => {
    try {
        const currentDate = new Date();
        const endDate = new Date();
        endDate.setDate(currentDate.getDate() + 7);

        // Fetch the appointments without grouping
        const bookedSlots = await prisma.appointment.findMany({
            where: {
                doctorId: id,
                isCancel: false,
                appointment_date: {
                    gte: currentDate,
                    lte: endDate,
                },
            },
            select: {
                appointment_date: true,
                appointment_time: true,
            },
            orderBy: {
                appointment_date: "asc"
            }
        });

        // Group the appointments by date
        const groupedSlots = bookedSlots.reduce((acc, slot) => {
            const dateKey = slot.appointment_date.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
            const formattedTime = slot.appointment_time; // Assuming time is already formatted as a string

            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }

            acc[dateKey].push(formattedTime);

            return acc;
        }, {});

        return { success: true, bookedSlots: groupedSlots };
    } catch (error) {
        console.error("Error fetching booked slots:", error);
        return { success: false, error };
    }
};

export const GET = async (req, { params }) => {
    try {
        const id = await getIdFromParams(params);

        // Fetch the doctor data
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: includeDoctorFullProfile,
        });

        if (!doctor) {
            return NextResponse.json({ status: 404, error: "Doctor not found" });
        }

        // Format doctor object without password
        const formattedDoctorObj = getUserWithoutPassword(doctor);

        // Fetch booked slots
        const { success, bookedSlots, error } = await getDoctorBookedSlots(id);

        if (!success) {
            return NextResponse.json({
                status: 500,
                error: error.message || "Failed to fetch booked slots",
            });
        }

        // Check if bookedSlots is valid and not null
        if (!bookedSlots || Object.keys(bookedSlots).length === 0) {
            return NextResponse.json({
                status: 404,
                error:
                    "No booked slots found for the doctor in the specified date range",
            });
        }

        // Return the doctor data and weekly schedule
        return NextResponse.json({
            status: 200,
            doctor: formattedDoctorObj,
            weeklySchedule: bookedSlots,
        });
    } catch (error) {
        return NextResponse.json({
            status: 500,
            error: error.message || "An unexpected error occurred",
        });
    }
};

export const POST = async (req, { params }) => {
    try {
        const id = await getIdFromParams(params);

        const {
            name,
            specialty,
            degree,
            password,
            experience,
            fee,
            about,
            isActive = true,
            addresses,
        } = await req.json();

        const updateData = {
            name: name || undefined,
            specialty: specialty || undefined,
            degree: degree || undefined,
            experience: experience || undefined,
            fee: fee || undefined,
            about: about || undefined,
            isActive: isActive || undefined,
            addresses: addresses || undefined,
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const doctor = await prisma.doctor.update({
            where: { id },
            data: updateData,
        });

        const formattedDoctorObj = getUserWithoutPassword(doctor);
        return NextResponse.json({ status: 200, doctor: formattedDoctorObj });
    } catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        const id = await getIdFromParams(params);
        const doctor = await prisma.doctor.delete({
            where: { id },
        });

        if (!doctor) {
            return NextResponse.json({ status: 404, error: "Doctor not found" });
        }

        return NextResponse.json({
            status: 200,
            message: "Doctor deleted successfully!",
        });
    } catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};
