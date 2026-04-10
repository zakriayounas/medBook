import { NextResponse } from "next/server";
import {
  handleFileDelete,
  handleFileUpload,
} from "../../../../../../lib/fileHandler";
import prisma from "../../../../../../lib/prisma";
import {
  extractLoggedUserDetail,
  getIdFromParams,
  getUserWithoutPassword,
} from "../../../../../../lib/UserHelpers";
import { isNumericId, toBoolean } from "../../../../../../utils/helpers";
// Example usage in your GET function
export const GET = async (req, { params }) => {
  try {
    const id = getIdFromParams(params);

    // Fetch the main doctor
    const doctor = await prisma.doctors.findUnique({
      where: {
        ...(isNumericId(id) ? { id: parseInt(id, 10) } : { uuid: id }),
        profile: { deletedAt: null },
      },
      include: {
        profile: true,
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
        NOT: {
          ...(isNumericId(id) ? { id: parseInt(id, 10) } : { uuid: id }),
        },
        profile: { deletedAt: null },
      },
      take: 6,
      include: {
        profile: true,
      },
    });

    // Retrieve current date and calculate date 7 days ahead
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setDate(currentDate.getDate() + 7);

    // Fetch appointments from the appointment table for the doctor for the next 7 days
    const weeklyBookings = await prisma.appointments.findMany({
      where: {
        doctor: {
          ...(isNumericId(id) ? { id: parseInt(id, 10) } : { uuid: id }),
        },
        appointmentDate: {
          gte: currentDate, // appointments from now
          lt: endDate, // until 7 days later (exclusive)
        },
      },
      orderBy: { appointmentDate: "asc" },
    });

    return NextResponse.json({
      status: 200,
      doctor,
      related_doctors: relatedDoctors,
      weeklyBookings,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message || "An unexpected error occurred",
    });
  }
};

export const POST = async (req, { params }) => {
  const { userRole } = extractLoggedUserDetail(req);
  if (userRole !== "ADMIN") {
    return NextResponse.json({
      status: 403,
      message: "Unauthorized: Only admins can update doctor information",
    });
  }
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
      phone,
    } = data;
    // Step 1: Check if doctor exists
    const existingDoctor = await prisma.doctors.findUnique({
      where: {
        ...(isNumericId(id) ? { id: parseInt(id, 10) } : { uuid: id }),
        profile: { deletedAt: null },
      },
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
        where: { id: userId, deletedAt: null },
      });

      if (existingUser?.profilePublicId) {
        const deleteResult = await handleFileDelete(
          existingUser.profilePublicId,
        );
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
      isActive: toBoolean(isActive),
    };

    // Step 5: Update doctor
    const updatedDoctor = await prisma.doctors.update({
      where: { ...(isNumericId(id) ? { id: parseInt(id, 10) } : { uuid: id }) },
      data: doctorUpdateData,
    });

    // Step 6: Prepare user update data
    const userUpdateData = {
      name: name || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || undefined,
      addresses: addresses ? JSON.parse(addresses) : undefined,
      phone: phone || undefined,
    };

    if (updatedProfileImage) userUpdateData.profileImage = updatedProfileImage;
    if (updatedProfilePublicId)
      userUpdateData.profilePublicId = updatedProfilePublicId;

    const updatedUser = await prisma.users.update({
      where: { id: userId, deletedAt: null },
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
    return NextResponse.json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

export const DELETE = async (req, { params }) => {
  try {
    const id = getIdFromParams(params);
    const doctor = await prisma.doctors.findUnique({
      where: {
        ...(isNumericId(id) ? { id: parseInt(id, 10) } : { uuid: id }),
        profile: { deletedAt: null },
      },
    });
    if (!doctor) {
      return NextResponse.json({ status: 404, message: "Doctor not found" });
    }
    await prisma.users.update({
      where: {
        id: doctor.userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      status: 200,
      message: "Doctor deleted successfully!",
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};
