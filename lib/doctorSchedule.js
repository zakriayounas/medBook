import { NextResponse } from "next/server";
import { getDayOfWeek, getWeekStartEndDate } from "../utils/helpers";
import prisma from "./prisma";

export async function addDefaultSchedule(doctorId) {
    const defaultSchedule = [
        {
            doctorId,
            day: "Monday",
            duration: 30,
            startTime: "09:00",
            endTime: "17:00",
        },
        {
            doctorId,
            day: "Tuesday",
            duration: 30,
            startTime: "09:00",
            endTime: "17:00",
        },
        {
            doctorId,
            day: "Wednesday",
            duration: 30,
            startTime: "09:00",
            endTime: "17:00",
        },
        {
            doctorId,
            day: "Thursday",
            duration: 30,
            startTime: "09:00",
            endTime: "17:00",
        },
        {
            doctorId,
            day: "Friday",
            duration: 30,
            startTime: "09:00",
            endTime: "17:00",
        },
        {
            doctorId,
            day: "Saturday",
            duration: 30,
            startTime: "10:00",
            endTime: "14:00",
        },
        {
            doctorId,
            day: "Sunday",
            duration: 30,
            startTime: "10:00",
            endTime: "14:00",
        },
    ];

    for (const schedule of defaultSchedule) {
        try {
            await prisma.doctorSchedules.create({
                data: {
                    doctorId: schedule.doctorId,
                    day: schedule.day,
                    duration: schedule.duration,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                },
            });
        } catch (error) {
            throw new Error("Failed to create schedule");
        }
    }
}

export async function generateTimeSlots({
    scheduleId,
    startTime,
    endTime,
    duration,
    isAvailable,
}) {
    const timeSlots = [];

    // Parse startTime and endTime strings into hours and minutes
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const currentDate = new Date(); // Use current date for base
    let currentTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        startHour,
        startMinute
    );
    const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        endHour,
        endMinute
    );

    // Generate time slots
    while (currentTime < endDate) {
        // Format slotTime as "HH:mm"
        const slotTime = currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        timeSlots.push({
            scheduleId,
            slotTime: slotTime, // Add formatted time
            isAvailable: isAvailable,
        });

        // Increment currentTime by duration
        currentTime = new Date(currentTime.getTime() + duration * 60 * 1000);
    }

    return timeSlots;
}

export const getDoctorBookedSlots = async (id) => {
    const { currentDate, endDate } = getWeekStartEndDate();
    try {
        // Fetch the appointments for the given doctor and date range
        const bookedSlots = await prisma.appointments.findMany({
            where: {
                doctorId: id,
                isCancel: false,
                appointmentDate: {
                    gte: currentDate,
                    lte: endDate,
                },
            },
            select: {
                appointmentDate: true,
            },
            orderBy: {
                appointmentDate: "asc",
            },
        });

        // Extract booked slot times
        const bookedTimes = bookedSlots.map((slot) =>
            new Date(slot.appointmentDate).toISOString()
        );
        return { success: true, bookedTimes };
    } catch (error) {
        return { success: false, error };
    }
};

export async function generateAvailableSlots(schedules, bookedTimes) {
    const availableSlotsByDay = {};

    for (const schedule of schedules) {
        // Generate slots for the current schedule
        const slots = await generateTimeSlots({
            scheduleId: schedule.scheduleId,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            duration: schedule.duration,
            isAvailable: true,
        });

        // Extract day and filter out booked slots
        const day = schedule.day;
        const availableSlots = slots
            .filter((slot) => !bookedTimes.includes(slot.slotTime)) // Remove booked slots
            .map((slot) => slot.slotTime); // Extract time as string

        // Add to the result grouped by day
        if (!availableSlotsByDay[day]) {
            availableSlotsByDay[day] = [];
        }
        availableSlotsByDay[day].push(...availableSlots);
    }

    return availableSlotsByDay;
}

export const getDoctorSchedules = async (id) => {
    // Fetch the doctor's schedule
    const doctorSchedules = await prisma.doctorSchedules.findMany({
        where: { doctorId: id },
        orderBy: { day: "asc" }, // Order by day for better structure
    });

    if (!doctorSchedules.length) {
        return NextResponse.json({
            status: 404,
            error: "Doctor's schedule not found",
        });
    }
    return doctorSchedules;
};
export const checkDoctorAvailability = async (doctorId, appointmentDate) => {
    // Check for existing appointments
    const existingAppointment = await prisma.appointments.findFirst({
        where: {
            appointmentDate: new Date(appointmentDate),
            doctorId,
            isCancel: false, // Exclude canceled appointments
        },
    });

    if (existingAppointment) {
        return false; // Time slot is already booked
    }

    return true; // Slot is available
};
