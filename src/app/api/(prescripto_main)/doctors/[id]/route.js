import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import {
    getIdFromParams,
    getUserWithoutPassword,
} from "../../../../../../lib/UserHelpers";
// Example usage in your GET function
export const GET = async (req, { params }) => {
    try {
        const id = getIdFromParams(params);

        // Fetch the main doctor
        const doctor = await prisma.doctors.findUnique({
            where: { id },
            include: {
                profile: true
            },
        });

        if (!doctor) {
            return NextResponse.json({ status: 404, message: "Doctor not found" });
        }

        // Extract specialty
        const { specialty } = doctor;

        // Fetch related doctors with the same specialty, excluding the current doctor
        const relatedDoctors = await prisma.doctors.findMany({
            where: {
                specialty,
                NOT: { id },
            },
            take: 6,
            include: {
                profile: true
            },
        });

        // Format doctor object without password
        const formattedDoctorObj = getUserWithoutPassword(doctor);

        return NextResponse.json({
            status: 200,
            doctor: formattedDoctorObj,
            related_doctors: relatedDoctors.map(getUserWithoutPassword),
        });
    } catch (error) {
        return NextResponse.json({
            status: 500,
            message: error.message || "An unexpected error occurred",
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
        return NextResponse.json({ status: 500, message: error.message || "Internal server error" });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        const id = getIdFromParams(params);
        const doctor = await prisma.doctors.delete({
            where: { id },
        });

        if (!doctor) {
            return NextResponse.json({ status: 404, message: "Doctor not found" });
        }

        return NextResponse.json({
            status: 200,
            message: "Doctor deleted successfully!",
        });
    } catch (error) {
        return NextResponse.json({ status: 500, message: error.message || "Internal server error" });
    }
};
