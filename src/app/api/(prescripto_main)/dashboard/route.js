import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { extractLoggedUserDetail } from "../../../../../lib/UserHelpers";

const formatGenderCounts = (data) => {
    const result = { MALE: 0, FEMALE: 0, OTHERS: 0 };
    data.forEach((item) => {
        result[item.gender] = item._count;
    });
    return result;
};

const getLatestAppointments = (doctorId) => {
    return prisma.appointments.findMany({
        where: doctorId ? { doctorId } : undefined,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            doctor: { include: { profile: true } },
            patient: true,
        },
    });
};

const getAppointmentStatusCounts = (doctorId, now) => {
    const whereBase = doctorId ? { doctorId } : {};
    return Promise.all([
        prisma.appointments.count({ where: whereBase }),
        prisma.appointments.count({
            where: { ...whereBase, isCancel: true },
        }),
        prisma.appointments.count({
            where: { ...whereBase, isCancel: false, appointmentDate: { lt: now } },
        }),
        prisma.appointments.count({
            where: { ...whereBase, isCancel: false, appointmentDate: { gte: now } },
        }),
    ]);
};

const getPaidAppointments = (doctorId) => {
    if (doctorId) {
        return prisma.transaction.count({
            where: { appointment: { doctorId } },
        });
    }
    return prisma.transaction.count({ where: { appointmentId: { not: null } } });
};

const getPatientGenderCounts = (doctorId) => {
    return prisma.users.groupBy({
        by: ["gender"],
        where: {
            role: "PATIENT",
            ...(doctorId && {
                appointments: {
                    some: { doctorId },
                },
            }),
        },
        _count: true,
    });
};

const getTotalPatients = (doctorId) => {
    return prisma.users.count({
        where: {
            role: "PATIENT",
            ...(doctorId && {
                appointments: {
                    some: { doctorId },
                },
            }),
        },
    });
};
export const GET = async (req) => {
    try {
        const { userRole, doctorId = undefined } = extractLoggedUserDetail(req);

        const now = new Date();

        const [
            latestAppointments,
            [totalAppointments, cancelledAppointments, completedAppointments, pendingAppointments],
            paidAppointments, totalPatients,
            patientGenderData,
        ] = await Promise.all([
            getLatestAppointments(doctorId),
            getAppointmentStatusCounts(doctorId, now),
            getPaidAppointments(doctorId),
            getTotalPatients(doctorId),
            getPatientGenderCounts(doctorId),
        ]);

        const data = {
            latestAppointments,
            totalAppointments,
            cancelledAppointments,
            completedAppointments,
            pendingAppointments,
            paidAppointments,
            totalPatients,
            patientGenderCounts: formatGenderCounts(patientGenderData),
        };

        if (userRole === "ADMIN") {
            const [latestDoctors, latestPatients, totalDoctors, doctorGenderData] = await Promise.all([
                prisma.doctors.findMany({
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: { profile: true },
                }),
                prisma.users.findMany({
                    where: { role: "PATIENT" },
                    take: 5,
                    orderBy: { createdAt: "desc" },
                }),
                prisma.users.count({ where: { role: "DOCTOR" } }),
                prisma.users.groupBy({
                    by: ["gender"],
                    where: { role: "DOCTOR" },
                    _count: true,
                }),
            ]);

            Object.assign(data, {
                latestDoctors,
                latestPatients,
                totalDoctors,
                doctorGenderCounts: formatGenderCounts(doctorGenderData),
            });
        }

        return NextResponse.json({ status: 200, data });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 500, error: error.message });
    }
};
