import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { createUser, getQueryFilters } from "../../../../../lib/UserHelpers";
import { validateRequiredFields } from "../../../../../lib/validator";
import { validateIsDoctorExists } from "../../../../../lib/doctorHelper";
import { addDefaultSchedule } from "../../../../../lib/doctorSchedule";

export const GET = async (req) => {
    const { whereClause, limitRecords, skipRecords, orderBy } = getQueryFilters(req)
    try {
        const doctors = await prisma.doctors.findMany({
            where: whereClause,
            select: {
                id: true,
                specialty: true,
                isActive: true,
                profile: {
                    select: {
                        name: true,
                        profileColor: true,
                        profileImage: true,
                        gender: true,
                    },
                },
            },
            orderBy, // Sorting applied here
            skip: skipRecords, // Pagination skip
            take: limitRecords, // Pagination limit
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
        const newUser = await createUser({
            name,
            password,
            confirm_password: password,
            email,
            file,
            isDoctor: true,
        });

        // If user creation fails, return the error
        if (!newUser.success) {
            return NextResponse.json({ message: newUser.error, status: 400 });
        }
        const { exists } = await validateIsDoctorExists({ userId: newUser.user.id });
        if (exists) {
            return NextResponse.json({
                error: "Doctor already exists with this email",
                status: 400,
            });
        }
        // Create the doctor record
        const doctor = await prisma.doctors.create({
            data: {
                specialty,
                degree,
                experience: parseInt(experience),
                fee: parseInt(fee),
                about,
                isActive: Boolean(isActive),
                addresses,
                userId: newUser.user.id, // Get the user ID from the successful user creation
            },
            include: {
                profile: {
                    select: {
                        name: true,
                        profileColor: true,
                        profileImage: true,
                        profilePublicId: true,
                    },
                },
            },
        });
        await addDefaultSchedule(doctor.id);
        return NextResponse.json(
            {
                doctor,
                message: "Doctor added successfully!",
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
