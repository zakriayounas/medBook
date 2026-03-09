import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import {
    getQueryFilters
} from "../../../../../lib/UserHelpers";

export const GET = async (req) => {
  const { whereClause, limitRecords, skipRecords, orderBy, page } =
    getQueryFilters(req, "PATIENT");
  const patientQuery = {
    ...whereClause,
    role: "PATIENT",
  };
  try {
    const total = await prisma.users.count({
      where: patientQuery,
    });
    const patients = await prisma.users.findMany({
      where: patientQuery,
      orderBy,
      skip: skipRecords,
      take: limitRecords,
    });
    const totalPages = Math.ceil(total / limitRecords);

    return NextResponse.json({
      status: 200,
      patients,
      pagination: {
        total,
        pageSize: limitRecords,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};
