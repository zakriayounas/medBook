import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { getIdFromParams } from "../../../../../../lib/UserHelpers";
import { generateTimeSlots } from "../../../../../../lib/doctorSchedule";

export const POST = async (req, { params }) => {
    try {
        const scheduleId = getIdFromParams(params);
        const { startTime, endTime, duration } = await req.json();

        const existingSchedule = await prisma.doctorsSchedules.findUnique({
            where: { scheduleId },
            include: { TimeSlot: true },
        });

        if (!existingSchedule) {
            return NextResponse.json(
                { success: false, message: "Schedule not found with this ID." },
                { status: 404 }
            );
        }

        if (existingSchedule.TimeSlot.some((slot) => !slot.isAvailable)) {
            return NextResponse.json(
                { success: false, message: "Cannot update schedule due to existing appointments." },
                { status: 400 }
            );
        }

        const updatedSchedule = await prisma.doctorsSchedules.update({
            where: { scheduleId },
            data: {
                startTime: startTime || existingSchedule.startTime,
                endTime: endTime || existingSchedule.endTime,
                duration: duration || existingSchedule.duration,
            },
        });

        await prisma.timeSlot.deleteMany({ where: { scheduleId } });

        const timeSlots = await generateTimeSlots({
            scheduleId: updatedSchedule.scheduleId,
            startTime: new Date(updatedSchedule.startTime),
            endTime: new Date(updatedSchedule.endTime),
            duration: updatedSchedule.duration,
        });
        console.log(timeSlots, "slots")
        return NextResponse.json(
            { success: true, message: "Schedule updated successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating schedule:", error.message);
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};


export const DELETE = async (req, { params }) => {
    try {
        const scheduleId = getIdFromParams(params);

        // Check if the schedule exists
        const existingSchedule = await prisma.doctorsSchedules.findUnique({
            where: { scheduleId },
        });

        if (!existingSchedule) {
            return NextResponse.json(
                { success: false, message: "Schedule not found with this ID." },
                { status: 404 }
            );
        }

        // Delete the schedule
        await prisma.doctorsSchedules.delete({
            where: { scheduleId },
        });

        return NextResponse.json(
            { success: true, message: "Schedule and related slots deleted successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting schedule:", error.message);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Internal server error",
            },
            { status: 500 }
        );
    }
};


// export const POST = async (req, { params }) => {
//     try {
//         const doctorId = getIdFromParams(params); // Assuming params contain the doctor's ID
//         const { startTime, endTime, duration } = await req.json();

//         // Validate input
//         if (!startTime || !endTime || !duration) {
//             return NextResponse.json(
//                 { success: false, message: "Start time, end time, and duration are required." },
//                 { status: 400 }
//             );
//         }

//         const start = new Date(startTime);
//         const end = new Date(endTime);

//         if (start >= end) {
//             return NextResponse.json(
//                 { success: false, message: "End time must be after start time." },
//                 { status: 400 }
//             );
//         }

//         // Check for overlapping schedules for the doctor
//         const overlappingSchedule = await prisma.doctorsSchedules.findFirst({
//             where: {
//                 doctorId,
//                 OR: [
//                     { startTime: { lte: end }, endTime: { gte: start } },
//                 ],
//             },
//         });

//         if (overlappingSchedule) {
//             return NextResponse.json(
//                 { success: false, message: "Schedule overlaps with an existing schedule." },
//                 { status: 400 }
//             );
//         }

//         // Create the new schedule
//         const newSchedule = await prisma.doctorsSchedules.create({
//             data: {
//                 doctorId,
//                 startTime: start,
//                 endTime: end,
//                 duration,
//             },
//         });

//         // Generate time slots
//         const timeSlots = [];
//         let currentTime = new Date(start);
//         while (currentTime < end) {
//             timeSlots.push({
//                 scheduleId: newSchedule.scheduleId,
//                 slotTime: currentTime.toISOString(),
//                 isAvailable: true,
//             });
//             currentTime = new Date(currentTime.getTime() + duration * 60 * 1000);
//         }

//         // Insert time slots
//         await prisma.timeSlot.createMany({ data: timeSlots });

//         return NextResponse.json(
//             { success: true, message: "Schedule added successfully.", schedule: newSchedule },
//             { status: 201 }
//         );
//     } catch (error) {
//         console.error("Error adding schedule:", error.message);
//         return NextResponse.json(
//             { success: false, message: error.message || "Internal server error"  },
//             { status: 500 }
//         );
//     }
// };
