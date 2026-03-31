import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { getRandomColor } from "../utils/helpers";
import { handleFileUpload } from "./fileHandler";
import prisma from "./prisma";
export const getUserWithoutPassword = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getIdFromParams = (params) => {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    throw new Error("Invalid ID");
  }

  return id;
};

export const extractLoggedUserDetail = (req) => {
  const userId = parseInt(req.headers.get("x-user-id"), 10) || null;
  const userRole = req.headers.get("x-role") || null;
  const userEmail = req.headers.get("x-email") || null;
  const doctorId = parseInt(req.headers.get("x-doctorId"), 10) || null;
  return {
    userId,
    userEmail,
    userRole,
    doctorId,
  };
};

export const createUser = async ({
  email,
  password,
  name,
  confirm_password,
  file,
  isDoctor,
  gender,
  addresses,
  phone,
}) => {
  try {
    if (!email || !password || !name || !confirm_password || !gender) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name, email, gender , password, and confirm password are required",
        },
        { status: 400 },
      );
    }

    if (password !== confirm_password) {
      return NextResponse.json(
        { success: false, error: "Password and confirm password do not match" },
        { status: 400 },
      );
    }

    let profileImage = null;
    let profilePublicId = null;
    if (file) {
      const uploadResult = await handleFileUpload(file);
      if (!uploadResult.success) {
        return NextResponse.json({
          message: "Profile image upload failed",
          status: 500,
        });
      }
      profileImage = uploadResult.secure_url;
      profilePublicId = uploadResult.public_id;
    }

    const existingUser = await prisma.users.findUnique({
      where: { email, deletedAt: null },
    });
    if (existingUser) {
      return {
        success: false,
        error: "User already exists with this email",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileColor = getRandomColor();
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileColor,
        profileImage,
        profilePublicId,
        role: isDoctor ? "DOCTOR" : "PATIENT",
        gender,
        addresses: addresses ? JSON.parse(addresses) : [],
        phone: phone || null,
      },
    });
    return {
      success: true,
      message: "User created successfully!",
      user: newUser,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getQueryFilters = (req, type) => {
  const { searchParams } = new URL(req.url);
  const { userRole, doctorId, userId } = extractLoggedUserDetail(req);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limitRecords = parseInt(searchParams.get("pageSize"), 10) || 15;
  const skipRecords = (page - 1) * limitRecords;

  let result = {
    whereClause: {},
    orderBy: { createdAt: "desc" },
  };

  if (type === "doctor") {
    result = buildDoctorFilters(searchParams);
  }

  if (type === "patient") {
    result = buildPatientFilters(searchParams);
  }

  if (type === "appointments") {
    result = buildAppointmentFilters(searchParams, userRole, doctorId, userId);
  }

  return {
    ...result,
    skipRecords,
    limitRecords,
    userRole,
    page,
  };
};

const buildAppointmentFilters = (searchParams, userRole, doctorId, userId) => {
  const doctorIds =
    userRole === "DOCTOR" ? String(doctorId) : searchParams.get("doctorId");

  const patientIds =
    userRole === "PATIENT" ? String(userId) : searchParams.get("patientId");

  const appointmentDateFrom = searchParams.get("appointment_from_date");
  const appointmentDateTo = searchParams.get("appointment_to_date");
  const status = searchParams.get("status");
  const minRating = searchParams.get("min_rating");
  const maxRating = searchParams.get("max_rating");

  let whereClause = {};
  let orderBy = { createdAt: "desc" };

  // Doctor filter
  if (doctorIds) {
    whereClause.doctorId = {
      in: doctorIds.split(",").map(Number),
    };
  }

  // Patient filter
  if (patientIds) {
    whereClause.patientId = {
      in: patientIds.split(",").map(Number),
    };
  }

  // Status filter
  if (status) {
    if (status === "canceled") {
      whereClause.isCancel = true;
    } else if (status === "completed") {
      whereClause.isCompleted = true;
    } else if (status === "pending") {
      whereClause.isCancel = false;
      whereClause.isCompleted = false;
    } else if (status === "paid") {
      whereClause.transactions = {
        some: {}, // at least one transaction exists
      };
    } else if (status === "unpaid") {
      whereClause.transactions = {
        none: {}, // no transaction exists
      };
    } else if (status === "rated") {
      whereClause.reviews = {
        some: {
          rating: {
            not: null,
          },
        },
      };
    } else if (status === "unrated") {
      whereClause.reviews = {
        none: {},
      };
    }
  }

  // Rating filter (via reviews relation)
  if (minRating || maxRating) {
    whereClause.reviews = {
      some: {
        rating: {
          ...(minRating && { gte: parseInt(minRating) }),
          ...(maxRating && { lte: parseInt(maxRating) }),
        },
      },
    };
  }

  // Appointment date filter
  if (appointmentDateFrom || appointmentDateTo) {
    whereClause.appointmentDate = {
      ...(appointmentDateFrom && { gte: new Date(appointmentDateFrom) }),
      ...(appointmentDateTo && { lte: new Date(appointmentDateTo) }),
    };
  }

  return { whereClause, orderBy };
};

const buildPatientFilters = (searchParams) => {
  const patientName = searchParams.get("name");
  const patientGender = searchParams.get("gender");
  const sortBy = searchParams.get("sort_by");
  const hasAppointments = searchParams.get("has_appointments");
  const joinedFromDate = searchParams.get("join_from_date");
  const joinedToDate = searchParams.get("join_to_date");

  let whereClause = {};
  let orderBy = { createdAt: "desc" };

  // Filter by name
  if (patientName) {
    whereClause.name = {
      contains: patientName
    };
  }

  // Filter by gender
  if (patientGender) {
    whereClause.gender = {
      in: patientGender.split(","),
    };
  }

  // Filter by join date
  if (joinedFromDate || joinedToDate) {
    whereClause.createdAt = {
      ...(joinedFromDate && { gte: new Date(joinedFromDate) }),
      ...(joinedToDate && { lte: new Date(joinedToDate) }),
    };
  }

  // Sorting
  if (sortBy === "alphabetically") {
    orderBy = { name: "asc" };
  } else if (sortBy === "newly") {
    orderBy = { createdAt: "desc" };
  } else if (sortBy === "oldest") {
    orderBy = { createdAt: "asc" };
  }

  if(hasAppointments){
    whereClause.appointments = {
        some: {}, // at least one appointment exists
    };
  }
  return { whereClause, orderBy };
};

const buildDoctorFilters = (searchParams) => {
  const specialties = searchParams.get("specialties");
  const minFee = searchParams.get("min_fee");
  const maxFee = searchParams.get("max_fee");
  const minRating = searchParams.get("min_rating");
  const maxRating = searchParams.get("max_rating");
  const doctorName = searchParams.get("name");
  const gender = searchParams.get("gender");
  const sortBy = searchParams.get("sort_by");
  const experienceMin = searchParams.get("min_experience");
  const experienceMax = searchParams.get("max_experience");
  const hasAppointments = searchParams.get("has_appointments");
  const joinedFromDate = searchParams.get("join_from_date");
  const joinedToDate = searchParams.get("join_to_date");

  let whereClause = {};
  let orderBy = [
    { ratingAverage: "desc" },
    { totalReviews: "desc" },
    { createdAt: "desc" },
  ];

  // Specialty filter
  if (specialties) {
    whereClause.specialty = {
      in: specialties.split(","),
    };
  }

  // Fee filter
  if (minFee || maxFee) {
    whereClause.fee = {
      ...(minFee && { gte: parseFloat(minFee) }),
      ...(maxFee && { lte: parseFloat(maxFee) }),
    };
  }

  // Rating filter
  if (minRating || maxRating) {
    whereClause.ratingAverage = {
      ...(minRating && { gte: parseFloat(minRating) }),
      ...(maxRating && { lte: parseFloat(maxRating) }),
    };
  }

  // Experience filter
  if (experienceMin || experienceMax) {
    whereClause.experienceYears = {
      ...(experienceMin && { gte: parseInt(experienceMin) }),
      ...(experienceMax && { lte: parseInt(experienceMax) }),
    };
  }

  // Join date filter
  if (joinedFromDate || joinedToDate) {
    whereClause.createdAt = {
      ...(joinedFromDate && { gte: new Date(joinedFromDate) }),
      ...(joinedToDate && { lte: new Date(joinedToDate) }),
    };
  }

  // Profile filters
  if (doctorName || gender) {
    whereClause.profile = {
      ...(doctorName && {
        name: {
          contains: doctorName
        },
      }),
      ...(gender && {
        gender: {
          in: gender.split(","),
        },
      }),
    };
  }

  // Sorting
  if (sortBy === "alphabetically") {
    orderBy = [{ profile: { name: "asc" } }];
  } else if (sortBy === "newly") {
    orderBy = [{ createdAt: "desc" }];
  } else if (sortBy === "oldest") {
    orderBy = [{ createdAt: "asc" }];
  } else if (sortBy === "rating") {
    orderBy = [{ ratingAverage: "desc" }];
  } else if (sortBy === "reviews") {
    orderBy = [{ totalReviews: "desc" }];
  } else if (sortBy === "fee_low") {
    orderBy = [{ fee: "asc" }];
  } else if (sortBy === "fee_high") {
    orderBy = [{ fee: "desc" }];
  }

  if(hasAppointments){
    whereClause.appointments = {
        some: {}, // at least one appointment exists
    };
  }
  return { whereClause, orderBy };
};