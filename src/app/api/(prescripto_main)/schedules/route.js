import { NextResponse } from "next/server";
import { getIdFromParams } from "../../../../../lib/UserHelpers";
import prisma from "../../../../../lib/prisma";
import { generateTimeSlots } from "../../../../../lib/doctorSchedule";

export const POST = async (req, { params }) => {
    try {
        const doctorId = getIdFromParams(params);
        const { startTime, endTime, duration } = await req.json();

        // Validate input
        if (!startTime || !endTime || !duration) {
            return NextResponse.json(
                { success: false, message: "Start time, end time, and duration are required." },
                { status: 400 }
            );
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            return NextResponse.json(
                { success: false, message: "End time must be after start time." },
                { status: 400 }
            );
        }

        // Check for overlapping schedules
        const overlappingSchedule = await prisma.doctorsSchedules.findFirst({
            where: {
                doctorId,
                OR: [
                    { startTime: { lte: end }, endTime: { gte: start } },
                ],
            },
        });

        if (overlappingSchedule) {
            return NextResponse.json(
                { success: false, message: "Schedule overlaps with an existing schedule." },
                { status: 400 }
            );
        }

        // Create new schedule
        const newSchedule = await prisma.doctorsSchedules.create({
            data: { doctorId, startTime: start, endTime: end, duration },
        });

        // Generate and insert time slots
        const timeSlots = await generateTimeSlots({
            scheduleId: newSchedule.scheduleId,
            startTime: start,
            endTime: end,
            duration,
        });

        console.log(timeSlots, "slots")
        return NextResponse.json(
            { success: true, message: "Schedule added successfully.", schedule: newSchedule },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding schedule:", error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
};
