import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getQueryFilters, getUserWithoutPassword } from "../../../../../lib/UserHelpers";

export const GET = async (req) => {
    let patients = [];
    const { whereClause, limitRecords, skipRecords, orderBy } = getQueryFilters(req, "PATIENT")
    const patientQuery = {
        ...whereClause,
        role: "PATIENT",
    }
    try {
        patients = await prisma.users.findMany({
            where: patientQuery,
            orderBy, // Sorting applied here
            skip: skipRecords, // Pagination skip
            take: limitRecords, // Pagination limit
        });
        patients = patients.map(pt => getUserWithoutPassword(pt));
        return NextResponse.json({ status: 200, patients });
    } catch (error) {
        return NextResponse.json({ status: 500, message: error.message || "Internal server error" });
    }
};
