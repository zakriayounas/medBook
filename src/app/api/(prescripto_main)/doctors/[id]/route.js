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
        const id = getIdFromParams(params);  // Extract doctor ID from params
        const userId = extractUserId(req);  // Extract user ID from the request (assuming the doctor is a user too)

        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());

        // Extract fields from the form data
        const { name, specialty, degree, experience, fee, about, isActive = true, addresses, dateOfBirth, gender } = data;

        // Handle profile image upload if present
        let updatedProfileImage = null;
        let updatedProfilePublicId = null;
        const file = formData.get("profileImage");
        if (file) {
            const uploadResult = await handleFileUpload(file);
            if (!uploadResult.success) {
                return NextResponse.json({
                    message: "Profile image upload failed",
                    status: 500,
                });
            }
            updatedProfileImage = uploadResult.secure_url;
            updatedProfilePublicId = uploadResult.public_id;

            // Find the existing user (doctor is also a user)
            const existingUser = await prisma.users.findUnique({
                where: { id: userId },
            });

            // If the user has an existing profile image, delete it before uploading the new one
            if (existingUser && existingUser.profilePublicId) {
                const deleteResult = await handleFileDelete(existingUser.profilePublicId);
                if (!deleteResult.success) {
                    return NextResponse.json({
                        message: "Failed to delete previous profile image",
                        status: 500,
                    });
                }
            }
        }

        // Prepare the update data for the doctor record
        const updateData = {
            specialty: specialty || undefined,
            degree: degree || undefined,
            experience: experience || undefined,
            fee: fee || undefined,
            about: about || undefined,
            isActive: isActive || undefined,
            addresses: addresses || undefined,
        };

        // If profile image or public ID is provided, include it in the doctor update data
        if (updatedProfileImage || updatedProfilePublicId) {
            updateData.profileImage = updatedProfileImage;
            updateData.profilePublicId = updatedProfilePublicId;
        }

        // Update the doctor data
        const doctor = await prisma.doctors.update({
            where: { id },
            data: updateData,
        });

        // Update the user table as well if any user-specific fields (like profile image) have changed
        const updatedUserProfile = await prisma.users.update({
            where: { id: userId },
            data: {
                name: name || undefined,
                dateOfBirth: dateOfBirth || undefined,
                gender: gender || undefined,
                profileImage: updatedProfileImage || undefined,
                profilePublicId: updatedProfilePublicId || undefined,
            },
        });

        // Return the updated doctor profile (without password)
        const formattedDoctorObj = getUserWithoutPassword(doctor);
        return NextResponse.json({ status: 200, doctor: formattedDoctorObj, user: updatedUserProfile });

    } catch (error) {
        console.error(error);
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
