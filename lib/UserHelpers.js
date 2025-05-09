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
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-role");
    const userEmail = req.headers.get("x-email");

    if (!userId || isNaN(userId)) {
        throw new Error("Invalid user ID");
    }

    return { userId: parseInt(userId, 10), userEmail, userRole }
};

export const createUser = async ({
    email,
    password,
    name,
    confirm_password,
    file,
    isDoctor, gender
}) => {
    try {
        if (!email || !password || !name || !confirm_password || !gender) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Name, email, gender , password, and confirm password are required",
                },
                { status: 400 }
            );
        }

        if (password !== confirm_password) {
            return NextResponse.json(
                { success: false, error: "Password and confirm password do not match" },
                { status: 400 }
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

        const existingUser = await prisma.users.findUnique({ where: { email } });
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
                gender
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

export const getQueryFilters = (req, role) => {
    const { searchParams } = new URL(req.url);
    const specialties = searchParams.get("specialties");
    const name = searchParams.get("name");
    const gender = searchParams.get("gender");
    const sort_by = searchParams.get("sort_by");
    const doctorIds = searchParams.get("doctorId");
    const patientIds = searchParams.get("patientId");
    const userRole = searchParams.get("userRole");
    const page = parseInt(searchParams.get("page") || "0", 10); // Default to 0 if page is not provided
    const limitRecords = 15;
    const skipRecords = page * limitRecords;

    let specialtyQuery = [];
    let filters = {};
    let orderBy = { createdAt: "desc" }; // Default sorting


    // appointment filters
    if (doctorIds) {
        const doctorIdsArray = doctorIds.split(",").map((id) => Number(id));
        filters = {
            doctorId: {
                in: doctorIdsArray,
            },
        };
    }
    if (patientIds) {
        const patientIdsArray = patientIds.split(",").map((id) => Number(id));
        filters = {
            ...filters,
            patientId: {
                in: patientIdsArray,
            },
        };
    }
    // Filter by specialties
    if (specialties) {
        const specialtyArray = specialties.split(",");
        specialtyQuery = {
            OR: specialtyArray.map((spec) => ({ specialty: spec })),
        };
    }

    // Filter by name
    if (name) {
        if (role === "PATIENT") {
            filters = {
                name: {
                    contains: name, // Partial match
                },
            };
        } else {
            filters.profile = {
                name: {
                    contains: name, // Partial match
                },
            };
        }
    }

    // Sort by
    if (sort_by) {
        if (sort_by === "newly") {
            orderBy = { createdAt: "desc" }; // Newest first
        } else if (sort_by === "alphabetically") {
            if (role === "PATIENT") {
                orderBy = {
                    name: "asc", // Alphabetical order by profile name
                }
            } else {
                orderBy = {
                    profile: {
                        name: "asc", // Alphabetical order by profile name
                    },
                };
            }
        }
    }

    // Filter by gender
    if (gender) {
        const genderArray = gender.split(",");
        if (role === "PATIENT") {
            filters = {
                ...filters,
                gender: {
                    in: genderArray,
                },
            };
        } else {
            filters.profile = {
                ...filters.profile,
                gender: {
                    in: genderArray,
                },
            };
        }
    }
    const whereClause = {
        ...specialtyQuery,
        ...filters,
    };
    console.log(whereClause, "whereClause")
    return { whereClause, skipRecords, limitRecords, orderBy, userRole };
};
