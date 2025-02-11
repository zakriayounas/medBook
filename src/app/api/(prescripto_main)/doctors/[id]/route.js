import { NextResponse } from "next/server";
import { generateAvailableSlots, getDoctorBookedSlots, getDoctorSchedules } from "../../../../../../lib/doctorSchedule";
import prisma from "../../../../../../lib/prisma";
import {
    getIdFromParams,
    getUserWithoutPassword,
} from "../../../../../../lib/UserHelpers";
// Example usage in your GET function
export const GET = async (req, { params }) => {
    try {
        const id = getIdFromParams(params);
        const doctorSchedules = await getDoctorSchedules(id);
        const { success, bookedTimes, error } = await getDoctorBookedSlots(id);

        if (!success) {
            return NextResponse.json({
                status: 500,
                error: error.message || "Failed to fetch booked slots",
            });
        }

        // Generate available slots for the week
        const availableSlots = await generateAvailableSlots(
            doctorSchedules,
            bookedTimes
        );

        const doctor = await prisma.doctors.findUnique({
            where: { id },
            include: {
                profile: {
                    select: {
                        name: true,
                        profileColor: true,
                        profileImage: true,
                        profilePublicId: true,
                    },
                }
            },
        });

        if (!doctor) {
            return NextResponse.json({ status: 404, error: "Doctor not found" });
        }

        // Format doctor object without password
        const formattedDoctorObj = getUserWithoutPassword(doctor);

        // Return the doctor data and weekly schedule
        return NextResponse.json({
            status: 200,
            doctor: formattedDoctorObj,
            weeklySchedule: availableSlots,
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
        const id = getIdFromParams(params);

        const {
            name,
            specialty,
            degree,
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

        const doctor = await prisma.doctors.update({
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
        const id = getIdFromParams(params);
        const doctor = await prisma.doctors.delete({
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
