import { NextResponse } from "next/server";
import Stripe from "stripe";
import { extractUserId } from "../../../../../../lib/UserHelpers";
import prisma from "../../../../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const POST = async (req) => {
    try {
        const userId = extractUserId(req);
        const { appointmentId, feeAmount, paymentMethodId, stripeCustomerId } = await req.json();
        if (!appointmentId || !feeAmount || !paymentMethodId || !stripeCustomerId) {
            return NextResponse.json(
                {
                    status: 400,
                    error: "appointmentId, feeAmount,stripeCustomerId and paymentMethodId are required.",
                },
                { status: 400 }
            );
        }

        // Create a PaymentIntent using the selected payment method
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(feeAmount * 100),
            currency: "usd",
            customer: stripeCustomerId,
            payment_method: paymentMethodId,
            confirm: true, // Directly attempt to confirm the payment
            metadata: {
                appointmentId: String(appointmentId),
                userId: String(userId),
            },
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
        });

        // Save the transaction in DB
        const transaction = await prisma.transaction.create({
            data: {
                appointmentId: parseInt(appointmentId),
                userId,
                stripePaymentIntentId: paymentIntent.id,
                amount: feeAmount,
                status: paymentIntent.status,
            },
        });

        return NextResponse.json({
            status: 200,
            message: "Payment successful!",
            transaction,
        });
    } catch (error) {
        console.error("Transaction API Error:", error);

        return NextResponse.json(
            { status: 500, message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};
