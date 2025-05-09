import { NextResponse } from "next/server";
import Stripe from "stripe";
import { extractLoggedUserDetail } from "../../../../../../lib/UserHelpers";
import prisma from "../../../../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const POST = async (req) => {
    try {
        const { userId } = extractLoggedUserDetail(req);
        const { appointmentId } = await req.json();
        if (!appointmentId) {
            return NextResponse.json(
                { error: "appointmentId is required." },
                { status: 400 }
            );
        }
        const appointment = await prisma.appointments.findUnique({
            where: { id: parseInt(appointmentId, 10) },
            select: {
                appointmentDate: true,
                doctor: {
                    select: {
                        specialty: true,
                        fee: true,
                        profile: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        const { doctor, appointmentDate } = appointment
        const { specialty, fee, profile } = doctor
        const { name } = profile

        const formattedDate = new Date(appointmentDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });


        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: Math.round(fee * 100),
                        product_data: {
                            name: process.env.APP_NAME
                                || "Medify", // Replace with your actual app name
                            description: `Consultation with ${name} (${specialty}) on ${formattedDate}`,
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/payment-verify?appointmentId=${appointmentId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-verify?cancel=true&appointmentId=${appointmentId}`,
            metadata: {
                userId: String(userId),
                appointmentId: String(appointmentId),
            },
        });

        return NextResponse.json({
            status: 200,
            url: session.url,
        });
    } catch (error) {
        console.error("Create Checkout Session Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};
