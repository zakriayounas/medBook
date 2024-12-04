import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { createUser } from "../../../../../lib/UserHelpers";
import { validateRequiredFields } from "../../../../../lib/validator";
import { validateIsDoctorExist } from "../../../../../lib/doctorHelper";

export const GET = async (req) => {
    const { searchParams } = new URL(req.url);
    const specialties = searchParams.get("specialties");
    let specialtyQuery = {};

    if (specialties) {
        const specialtyArray = specialties.split(",");
        specialtyQuery = {
            OR: specialtyArray.map((spec) => ({ specialty: spec })),
        };
    }
    try {
        const doctors = await prisma.doctor.findMany({
            where: specialties ? specialtyQuery : {},
            select: {
                id: true,
                name: true,
                specialty: true,
                isActive: true,
                profileColor: true,
                profileImage: true,
            },
        });
        return NextResponse.json({ status: 200, doctors });
    } catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};

export const POST = async (req) => {
    try {
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());

        const {
            name,
            email,
            specialty,
            degree,
            password,
            experience,
            fee,
            about,
            isActive = true,
            addresses,
        } = data;

        const validationError = validateRequiredFields({
            name,
            email,
            specialty,
            degree,
            password,
            experience,
            fee,
            about,
            addresses,
        });

        if (validationError) {
            return NextResponse.json({ message: validationError, status: 400 });
        }

        const file = formData.get("profileImage");

        // Call createUser and pass `isDoctor: true` for doctor-specific creation
        const newUser = await createUser({ name, password, confirm_password: password, email, file, isDoctor: true });

        // If user creation fails, return the error
        if (!newUser.success) {
            return NextResponse.json({ message: newUser.error, status: 400 });
        }
        const { exists } = await validateIsDoctorExist(newUser.user.id)
        if (exists) {
            return NextResponse.json({ error: "Doctor already exists with this email", status: 400 });
        }
        // Create the doctor record
        const doctor = await prisma.doctor.create({
            data: {
                specialty,
                degree,
                experience: parseInt(experience),
                fee: parseInt(fee),
                about,
                isActive: Boolean(isActive),
                addresses,
                userId: newUser.user.id  // Get the user ID from the successful user creation
            },
            include: {
                profile: {
                    select: {
                        name: true,
                        profileColor: true,
                        profileImage: true,
                        profilePublicId: true
                    }
                }
            }
        });

        return NextResponse.json(
            {
                doctor,
                message: "Doctor added successfully!"
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

