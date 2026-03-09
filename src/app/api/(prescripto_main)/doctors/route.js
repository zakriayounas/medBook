import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import {
  createUser,
  extractLoggedUserDetail,
  getQueryFilters,
} from "../../../../../lib/UserHelpers";
import { validateRequiredFields } from "../../../../../lib/validator";
import { toBoolean } from "../../../../../utils/helpers";

export const GET = async (req) => {
  const { whereClause, limitRecords, skipRecords, orderBy, page } =
    getQueryFilters(req);
  try {
     const total = await prisma.doctors.count({
      where: whereClause,
    });
    const doctors = await prisma.doctors.findMany({
      where: whereClause,
      include: {
        profile: true,
      },
      orderBy, // Sorting applied here
      skip: skipRecords, // Pagination skip
      take: limitRecords, // Pagination limit
    });

    const totalPages = Math.ceil(total / limitRecords);

    return NextResponse.json({
      status: 200,
      doctors,
      pagination: {
        total,
        pageSize: limitRecords,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return NextResponse.json({ status: 500, error: error.message });
  }
};

export const POST = async (req) => {
  const { userRole } = extractLoggedUserDetail(req);
  if (userRole !== "ADMIN") {
    return NextResponse.json({
      status: 403,
      message: "Unauthorized: Only admins can add doctors.",
    });
  }
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());

    const {
      name,
      email,
      gender,
      specialty,
      degree,
      password,
      experience,
      fee,
      about,
      isActive = true,
      addresses,
      phone,
    } = data;

    const validationError = validateRequiredFields({
      name,
      email,
      specialty,
      degree,
      password,
      experience,
      fee,
    });

    if (validationError) {
      return NextResponse.json({ message: validationError, status: 400 });
    }

    const file = formData.get("profileImage");

    // Call createUser and pass `isDoctor: true` for doctor-specific creation
    const newUser = await createUser({
      name,
      password,
      confirm_password: password,
      email,
      file,
      isDoctor: true,
      gender,
      addresses: addresses || undefined,
      phone: phone || null,
    });

    // If user creation fails, return the error
    if (!newUser.success) {
      return NextResponse.json({ message: newUser.error, status: 400 });
    }
    // Create the doctor record
    const doctor = await prisma.doctors.create({
      data: {
        specialty,
        degree,
        experience: parseInt(experience),
        fee: parseInt(fee),
        about: about || undefined,
        isActive: toBoolean(isActive),
        userId: newUser.user.id, 
      },
      include: {
        profile: true
      },
    });
    return NextResponse.json(
      {
        doctor,
        message: "Doctor added successfully!",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
};
