import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "../../../../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const POST = async (req) => {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const appointmentId = parseInt(session.metadata.appointmentId);
        const userId = parseInt(session.metadata.userId);
        const paymentIntentId = session.payment_intent;
        const amount = session.amount_total / 100;

        try {
            await prisma.transaction.create({
                data: {
                    appointmentId,
                    userId,
                    stripePaymentIntentId: paymentIntentId,
                    amount,
                    status: "succeeded",
                },
            });
        } catch (err) {
            console.error("Error saving transaction from webhook:", err);
        }
    }

    return NextResponse.json({ received: true });
};
