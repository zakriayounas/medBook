import bcrypt from "bcrypt";
import { convertToSQLDatetime, getRandomColor } from "../utils/helpers";
import { handleFileUpload } from "./fileHandler";
import prisma from "./prisma";
export const getUserWithoutPassword = (user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const getIdFromParams = async (params) => {
    const id = await parseInt(params.id, 10);

    if (isNaN(id)) {
        throw new Error("Invalid ID");
    }

    return id;
};

export const extractUserId = (req) => {
    const userId = req.headers.get("x-user-id");

    if (!userId || isNaN(userId)) {
        throw new Error("Invalid user ID");
    }

    return parseInt(userId, 10);
};

export const validateAppointmentTime = async (appointment_date, appointment_time, doctorId) => {
    // Convert the provided date and time into the correct SQL datetime format
    const formattedDateTime = convertToSQLDatetime(appointment_date, appointment_time);

    // Prisma expects Date object or valid DateTime format
    const appointmentDate = new Date(formattedDateTime);

    // Ensure valid date
    if (isNaN(appointmentDate)) {
        return { success: false, error: "Invalid date format" };
    }

    // Check if appointment already exists
    const isAppointmentExist = await prisma.appointment.findFirst({
        where: {
            doctorId,
            appointment_date: appointmentDate, // Pass Date object to Prisma
            appointment_time,
        },
    });

    if (isAppointmentExist) {
        return { success: false, error: "Appointment already exists at this time" };
    }

    return { success: true };
};

export const createUser = async ({
    email,
    password,
    name,
    confirm_password,
    file,
    isDoctor,
}) => {
    try {
        if (!email || !password || !name || !confirm_password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Name, email, password, and confirm password are required",
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

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            if (isDoctor) {
                return {
                    success: true,
                    user: existingUser,
                };
            } else {
                return NextResponse.json(
                    { success: false, error: "User already exists with this email" },
                    { status: 409 }
                );
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileColor = getRandomColor();

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                profileColor,
                profileImage,
                profilePublicId,
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
