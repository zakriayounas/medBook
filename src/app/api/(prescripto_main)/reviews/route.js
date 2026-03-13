import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export const POST = async (req) => {
  try {
    const { appointmentId, comment, rating } = await req.json();

    if (!appointmentId || !rating) {
      return NextResponse.json(
        { message: "AppointmentId and rating are required" },
        { status: 400 },
      );
    }

    const parsedRating = parseInt(rating);

    if (parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    const appointment = await prisma.appointments.findFirst({
      where: {
        id: parseInt(appointmentId),
      },
      select: {
        patientId: true,
        doctorId: true,
        isCompleted: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 },
      );
    }

    // if (!appointment.isCompleted) {
    //   return NextResponse.json(
    //     { message: "Review allowed only after completed appointment" },
    //     { status: 400 },
    //   );
    // }

    const { doctorId, patientId } = appointment;

    const existingReview = await prisma.doctorReviews.findFirst({
      where: {
        appointmentId: parseInt(appointmentId),
        patientId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { message: "Review already submitted for this appointment" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // create review
      const review = await tx.doctorReviews.create({
        data: {
          appointmentId: parseInt(appointmentId),
          doctorId,
          patientId,
          comment,
          rating: parsedRating,
        },
      });

      // get doctor current stats
      const doctor = await tx.doctors.findUnique({
        where: { id: doctorId },
        select: {
          ratingAverage: true,
          totalReviews: true,
        },
      });

      const currentAverage = doctor.ratingAverage || 0;
      const totalReviews = doctor.totalReviews || 0;

      const newTotal = totalReviews + 1;

      const newAverage = Number(
        ((currentAverage * totalReviews + parsedRating) / newTotal).toFixed(1),
      );

      await tx.doctors.update({
        where: { id: doctorId },
        data: {
          ratingAverage: newAverage,
          totalReviews: newTotal,
        },
      });

      return review;
    });

    return NextResponse.json({
      status: 200,
      message: "Review added successfully",
      data: result,
    });
  } catch (error) {
    console.log(error.message || "Internal server error");
    return NextResponse.json(
      {
        message: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
};

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);

    const doctorId = searchParams.get("doctorId");
    const page = parseInt(searchParams.get("page") || "1");
    const limitRecords = parseInt(searchParams.get("pageSize"), 10) || 15;

    const skipRecords = (page - 1) * limitRecords;

    const whereClause = {};

    if (doctorId) {
      whereClause.doctorId = parseInt(doctorId);
    }

    // total count
    const total = await prisma.doctorReviews.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(total / limitRecords);

    // fetch reviews
    const reviewsRaw = await prisma.doctorReviews.findMany({
      where: whereClause,
      skip: skipRecords,
      take: limitRecords,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        patient: {
          select: {
            name: true,
            profileImage: true,
            profileColor: true,
          },
        },
        doctor: {
          select: {
            profile: {
              select: {
                name: true,
                profileImage: true,
                profileColor: true,
              },
            },
          },
        },
      },
    });

    // flatten response
    const reviews = reviewsRaw.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,

      patient: {
        name: r.patient?.name,
        profileImage: r.patient?.profileImage,
        profileColor: r.patient?.profileColor,
      },

      doctor: {
        name: r.doctor?.profile?.name,
        profileImage: r.doctor?.profile?.profileImage,
        profileColor: r.doctor?.profile?.profileColor,
      },
    }));

    // calculate average rating
    const ratingAgg = await prisma.doctorReviews.aggregate({
      where: whereClause,
      _avg: {
        rating: true,
      },
    });

    const averageRating = ratingAgg._avg.rating
      ? Number(ratingAgg._avg.rating.toFixed(1))
      : 0;

    return NextResponse.json({
      status: 200,
      averageRating,
      totalReviews: total,
      reviews,
      pagination: {
        total,
        pageSize: limitRecords,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
};
