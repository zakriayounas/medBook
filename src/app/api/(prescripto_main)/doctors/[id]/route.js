import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import {
    extractUserId,
    getIdFromParams,
    getUserWithoutPassword,
} from "../../../../../../lib/UserHelpers";
import { handleFileDelete, handleFileUpload } from "../../../../../../lib/fileHandler";
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
        const id = getIdFromParams(params); // doctorId from URL params
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());

        const {
            name,
            specialty,
            degree,
            experience,
            fee,
            about,
            isActive = true,
            addresses,
            dateOfBirth,
            gender,
        } = data;

        // Step 1: Check if doctor exists
        const existingDoctor = await prisma.doctors.findUnique({
            where: { id },
        });

        if (!existingDoctor) {
            return NextResponse.json({ status: 404, message: "Doctor not found" });
        }

        // Step 2: Extract userId from doctor object
        const userId = existingDoctor.userId;

        // Step 3: Handle profile image upload if provided
        let updatedProfileImage = null;
        let updatedProfilePublicId = null;

        const file = formData.get("profileImage");
        if (file && file.name) {
            const uploadResult = await handleFileUpload(file);
            if (!uploadResult.success) {
                return NextResponse.json({
                    message: "Profile image upload failed",
                    status: 500,
                });
            }

            updatedProfileImage = uploadResult.secure_url;
            updatedProfilePublicId = uploadResult.public_id;

            const existingUser = await prisma.users.findUnique({
                where: { id: userId },
            });

            if (existingUser?.profilePublicId) {
                const deleteResult = await handleFileDelete(existingUser.profilePublicId);
                if (!deleteResult.success) {
                    return NextResponse.json({
                        message: "Failed to delete previous profile image",
                        status: 500,
                    });
                }
            }
        }
        // Step 4: Prepare doctor update data
        const doctorUpdateData = {
            specialty: specialty || undefined,
            degree: degree || undefined,
            experience: parseInt(experience) || undefined,
            fee: parseInt(fee) || undefined,
            about: about || undefined,
            isActive: Boolean(isActive) || undefined,
            addresses: addresses || undefined,
        };

        // Step 5: Update doctor
        const updatedDoctor = await prisma.doctors.update({
            where: { id },
            data: doctorUpdateData,
        });

        // Step 6: Prepare user update data
        const userUpdateData = {
            name: name || undefined,
            dateOfBirth: dateOfBirth || undefined,
            gender: gender || undefined,
        };

        if (updatedProfileImage) userUpdateData.profileImage = updatedProfileImage;
        if (updatedProfilePublicId) userUpdateData.profilePublicId = updatedProfilePublicId;

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: userUpdateData,
        });

        // Final: return cleaned result
        return NextResponse.json({
            status: 200,
            doctor: updatedDoctor,
            user: getUserWithoutPassword(updatedUser),
        });

    } catch (error) {
        console.log(error);
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
